import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../services/firebase';
import { PAYMENT_METHODS, TRIP_STATUS } from '../config/trips';
import { TRIPS_COLLECTION } from '../services/tripService';

const DAY_MS = 24 * 60 * 60 * 1000;

// Inicio del día local.
function startOfDay(date = new Date()) {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Semana calendario que empieza el lunes.
export function startOfWeek(date = new Date()) {
  const copy = startOfDay(date);
  const day = copy.getDay(); // 0 = domingo
  const diff = day === 0 ? 6 : day - 1;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

// Mes calendario.
export function startOfMonth(date = new Date()) {
  const copy = startOfDay(date);
  copy.setDate(1);
  return copy;
}

// Convierte el campo de fecha de Firestore o ISO a Date.
function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// Resume los viajes de un periodo: facturación, comisión,
// propinas, ganancia neta y promedio por viaje.
function summarizeBetween(trips, from, to = new Date()) {
  const filtered = trips.filter((trip) => {
    const when = toDate(trip.completedAt) ?? toDate(trip.requestedAt);
    return when && when >= from && when <= to;
  });

  const totals = filtered.reduce(
    (acc, trip) => {
      acc.billed += Number(trip.fare) || 0;
      acc.commission += Number(trip.commission) || 0;
      acc.tips += Number(trip.tip) || 0;
      acc.amount += Number(trip.driverEarnings) || 0;
      return acc;
    },
    {
      billed: 0,
      commission: 0,
      tips: 0,
      amount: 0,
    }
  );

  return {
    trips: filtered.length,
    billed: totals.billed,
    commission: totals.commission,
    tips: totals.tips,
    amount: totals.amount,
    average: filtered.length ? totals.amount / filtered.length : 0,
  };
}

// Ganancias del conductor y saldo pendiente de liquidación.
export default function useEarnings(driverId) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !driverId) {
      setIsLoading(false);
      return () => { };
    }

    setIsLoading(true);
    const q = query(
      collection(db, TRIPS_COLLECTION),
      where('driverId', '==', driverId),
      where('status', '==', TRIP_STATUS.PAID),
      orderBy('completedAt', 'desc'),
      limit(200)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        setTrips(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError?.message ?? 'No se pudieron cargar las ganancias');
        setIsLoading(false);
      }
    );
  }, [driverId]);

  const summary = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const week = startOfWeek(now);
    const month = startOfMonth(now);

    // Saldo: lo cobrado por tarjeta queda pendiente de liquidación;
    // lo cobrado en efectivo ya está en manos del conductor y solo
    // se descuenta la comisión que le debe a la plataforma.
    const pendingBalance = trips.reduce((total, trip) => {
      const earnings = Number(trip.driverEarnings) || 0;
      const commission = Number(trip.commission) || 0;
      if (trip.paymentMethod === PAYMENT_METHODS.CASH) {
        return total - commission;
      }
      return total + earnings;
    }, 0);

    return {
      today: summarizeBetween(trips, today),
      week: summarizeBetween(trips, week),
      month: summarizeBetween(trips, month),
      pendingBalance,
    };
  }, [trips]);

  const refresh = useCallback(() => {
    // El snapshot ya mantiene los datos al día; existe por simetría de API.
    setIsLoading((prev) => prev);
  }, []);

  return { trips, summary, isLoading, error, refresh };
}
