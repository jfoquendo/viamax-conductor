import { useEffect, useMemo, useState } from 'react';
import { tripSource } from '../services/tripService';

// Filtros disponibles en la pantalla de historial.
export const HISTORY_FILTERS = {
  today: 'Hoy',
  week: 'Semana',
  month: 'Mes',
  all: 'Todo',
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Inicio del dia local.
function startOfDay(date) {
  const copy = new Date(date.getTime());
  copy.setHours(0, 0, 0, 0);
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

// Fecha que representa el viaje: cierre si existe, si no la solicitud.
function tripDate(trip) {
  return toDate(trip.completedAt) ?? toDate(trip.paidAt) ?? toDate(trip.requestedAt);
}

function filterStart(filter, now = new Date()) {
  switch (filter) {
    case 'today':
      return startOfDay(now);
    case 'week': {
      const start = startOfDay(now);
      const day = start.getDay();
      start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
      return start;
    }
    case 'month': {
      const start = startOfDay(now);
      start.setDate(1);
      return start;
    }
    default:
      return null;
  }
}

// Historial de viajes cerrados del conductor con filtro por periodo.
export default function useTripHistory(driverId) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!driverId) {
      setIsLoading(false);
      return () => {};
    }

    setIsLoading(true);
    return tripSource.subscribeHistory(
      driverId,
      (data) => {
        setTrips(Array.isArray(data) ? data : []);
        setIsLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        setError(subscriptionError?.message ?? 'No se pudo cargar el historial');
        setIsLoading(false);
      }
    );
  }, [driverId]);

  const filtered = useMemo(() => {
    const from = filterStart(filter);
    if (!from) return trips;

    return trips.filter((trip) => {
      const when = tripDate(trip);
      return when && when >= from;
    });
  }, [trips, filter]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, trip) => {
        acc.amount += Number(trip.driverEarnings) || 0;
        acc.distance += Number(trip.distanceKm) || 0;
        acc.count += 1;
        return acc;
      },
      { amount: 0, distance: 0, count: 0 }
    );
  }, [filtered]);

  return { trips: filtered, totals, filter, setFilter, isLoading, error };
}
