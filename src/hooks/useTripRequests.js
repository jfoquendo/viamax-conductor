// Solicitudes entrantes con asesoria de IA (docs/AI_LOG.md #10 y #12).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { REQUEST_TIMEOUT_SECONDS, TRIP_STATUS } from '../config/trips';
import { tripSource } from '../services/tripService';

// Gestiona las solicitudes entrantes del conductor.
// - Escucha Firestore y mantiene la lista completa de solicitudes pendientes.
// - La primera sin descartar y dentro de los 15 segundos es la "activa".
// - Al vencer o rechazar, se registra en Firestore para que no vuelva a aparecer.
export default function useTripRequests({ enabled = true, driverId = null } = {}) {
  const [requests, setRequests] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [request, setRequest] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(REQUEST_TIMEOUT_SECONDS);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState(null);

  // ids descartados en esta sesion (se suman a skippedBy de Firestore)
  const dismissedRef = useRef(new Set());
  // hora en que vio cada solicitud, para saber si aun tiene tiempo
  const seenAtRef = useRef(new Map());

  // Escucha las solicitudes pendientes.
  useEffect(() => {
    if (!enabled) {
      setRequests([]);
      setRequest(null);
      return () => {};
    }

    const unsubscribe = tripSource.subscribePending(
      driverId,
      (trips) => {
        const disponibles = [];
        const recientes = [];

        (trips ?? []).forEach((trip) => {
          const skipped = Array.isArray(trip.skippedBy) ? trip.skippedBy : [];
          const descartada =
            dismissedRef.current.has(trip.id) ||
            (driverId ? skipped.includes(driverId) : false);
          const cerrada = trip.status === TRIP_STATUS.CANCELLED;

          if (descartada || cerrada) {
            recientes.push(trip);
            return;
          }

          disponibles.push(trip);

          // Registra la hora de llegada de cada solicitud nueva.
          if (!seenAtRef.current.has(trip.id)) {
            seenAtRef.current.set(trip.id, Date.now());
          }
        });

        setRequests(disponibles);
        setRecentRequests(recientes.slice(0, 8));
      },
      (subscriptionError) => setError(subscriptionError?.message ?? 'Error de sincronización')
    );

    return unsubscribe;
  }, [enabled, driverId]);

  // La solicitud activa es la primera que aun tiene tiempo de respuesta.
  useEffect(() => {
    const now = Date.now();
    const vigente = requests.find((trip) => {
      const seen = seenAtRef.current.get(trip.id) ?? now;
      return (now - seen) / 1000 < REQUEST_TIMEOUT_SECONDS;
    });

    setRequest((prev) => (prev?.id === vigente?.id ? prev : vigente ?? null));
  }, [requests]);

  // Cuenta regresiva de la solicitud activa.
  useEffect(() => {
    if (!request) {
      setSecondsLeft(REQUEST_TIMEOUT_SECONDS);
      return () => {};
    }

    const seenAt = seenAtRef.current.get(request.id) ?? Date.now();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - seenAt) / 1000);
      const remaining = Math.max(REQUEST_TIMEOUT_SECONDS - elapsed, 0);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        // Se descarta para este conductor, sin cancelar el viaje del pasajero.
        dismissedRef.current.add(request.id);
        tripSource.skipRequest?.(request.id, driverId);
        setRequest(null);
        setRequests((prev) => prev.filter((trip) => trip.id !== request.id));
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [request?.id, driverId]);

  const accept = useCallback(async () => {
    if (!request || isResponding) return null;
    setIsResponding(true);
    setError(null);
    try {
      await tripSource.accept(request.id, driverId);
      const accepted = { ...request, status: TRIP_STATUS.ACCEPTED };
      setRequest(null);
      setRequests([]);
      return accepted;
    } catch (acceptError) {
      setError(acceptError?.message ?? 'No se pudo aceptar el viaje');
      return null;
    } finally {
      setIsResponding(false);
    }
  }, [request, isResponding, driverId]);

  const reject = useCallback(async () => {
    if (!request || isResponding) return;
    const rejectedId = request.id;
    setIsResponding(true);
    setError(null);
    try {
      dismissedRef.current.add(rejectedId);
      await tripSource.skipRequest?.(rejectedId, driverId);
      setRequest(null);
      setRequests((prev) => prev.filter((trip) => trip.id !== rejectedId));
    } catch (rejectError) {
      setError(rejectError?.message ?? 'No se pudo descartar la solicitud');
    } finally {
      setIsResponding(false);
    }
  }, [request, isResponding, driverId]);

  // Segundos restantes por solicitud, para la lista.
  const secondsFor = useCallback((tripId) => {
    const seenAt = seenAtRef.current.get(tripId);
    if (!seenAt) return REQUEST_TIMEOUT_SECONDS;
    const elapsed = Math.floor((Date.now() - seenAt) / 1000);
    return Math.max(REQUEST_TIMEOUT_SECONDS - elapsed, 0);
  }, []);

  const progress = request ? secondsLeft / REQUEST_TIMEOUT_SECONDS : 0;

  const pendingCount = useMemo(() => requests.length, [requests]);

  return {
    request,
    requests,
    recentRequests,
    pendingCount,
    secondsLeft,
    progress,
    secondsFor,
    isResponding,
    error,
    accept,
    reject,
  };
}
