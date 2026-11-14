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

// Convierte una fecha YYYY-MM-DD del filtro en una fecha local.
function filterDate(value, endOfDay = false) {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
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
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [lastDocument, setLastDocument] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!driverId) {
      setIsLoading(false);
      return () => { };
    }

    let cancelled = false;

    const loadInitialPage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const page = await tripSource.fetchHistoryPage(driverId);

        if (cancelled) return;

        setTrips(page.trips);
        setLastDocument(page.lastDocument);
        setHasMore(page.hasMore);
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError?.message ?? 'No se pudo cargar el historial'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitialPage();

    return () => {
      cancelled = true;
    };
  }, [driverId]);

  const loadMore = async () => {
    if (!driverId || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const page = await tripSource.fetchHistoryPage(
        driverId,
        lastDocument
      );

      setTrips((current) => {
        const existingIds = new Set(current.map((trip) => trip.id));
        const newTrips = page.trips.filter(
          (trip) => !existingIds.has(trip.id)
        );

        return [...current, ...newTrips];
      });

      setLastDocument(page.lastDocument);
      setHasMore(page.hasMore);
    } catch (loadError) {
      setError(
        loadError?.message ?? 'No se pudieron cargar más viajes'
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filtered = useMemo(() => {
    const from = filterStart(filter);
    const customFrom = filterDate(dateFrom);
    const customTo = filterDate(dateTo, true);

    return trips.filter((trip) => {
      const when = tripDate(trip);
      const matchesDate = !from || (when && when >= from);
      const matchesCustomRange =
        (!customFrom || (when && when >= customFrom)) &&
        (!customTo || (when && when <= customTo));
      const matchesPayment = paymentFilter === 'all' || trip.paymentMethod === paymentFilter;
      return matchesDate && matchesCustomRange && matchesPayment;
    });
  }, [trips, filter, paymentFilter, dateFrom, dateTo]);

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

  return { 
    trips: filtered,
    totals, filter,
    setFilter,
    paymentFilter,
    setPaymentFilter,
    isLoading,
    error,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    loadMore,
    hasMore,
    isLoadingMore };
}
