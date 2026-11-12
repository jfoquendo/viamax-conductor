import { useCallback, useEffect, useRef, useState } from 'react';
import { REQUEST_TIMEOUT_SECONDS, TRIP_STATUS } from '../config/trips';
import { tripSource } from '../services/tripService';

// Gestiona las solicitudes entrantes del conductor.
// - Escucha la fuente activa (Firestore o local).
// - Muestra solo la solicitud más antigua pendiente.
// - Cuenta 15 segundos para responder; al expirar se descarta sola.
export default function useTripRequests({ enabled = true, driverId = null } = {}) {
  const [request, setRequest] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(REQUEST_TIMEOUT_SECONDS);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState(null);

  const dismissedRef = useRef(new Set());

  // Escucha las solicitudes pendientes.
  useEffect(() => {
    if (!enabled) {
      setRequest(null);
      return () => {};
    }

    const unsubscribe = tripSource.subscribePending(
      (trips) => {
        const next = trips.find((trip) => !dismissedRef.current.has(trip.id)) ?? null;
        setRequest((prev) => (prev?.id === next?.id ? prev : next));
      },
      (subscriptionError) => setError(subscriptionError?.message ?? 'Error de sincronización')
    );

    return unsubscribe;
  }, [enabled]);

  // Reinicia el contador cada vez que aparece una solicitud nueva.
  useEffect(() => {
    if (!request) {
      setSecondsLeft(REQUEST_TIMEOUT_SECONDS);
      return () => {};
    }

    setSecondsLeft(REQUEST_TIMEOUT_SECONDS);
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(REQUEST_TIMEOUT_SECONDS - elapsed, 0);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        // Se descarta localmente: no se cancela el viaje del pasajero.
        dismissedRef.current.add(request.id);
        setRequest(null);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [request?.id]);

  const accept = useCallback(async () => {
    if (!request || isResponding) return null;
    setIsResponding(true);
    setError(null);
    try {
      await tripSource.accept(request.id, driverId);
      const accepted = { ...request, status: TRIP_STATUS.ACCEPTED };
      setRequest(null);
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
    setIsResponding(true);
    setError(null);
    try {
      await tripSource.reject(request.id);
      dismissedRef.current.add(request.id);
      setRequest(null);
    } catch (rejectError) {
      setError(rejectError?.message ?? 'No se pudo rechazar el viaje');
    } finally {
      setIsResponding(false);
    }
  }, [request, isResponding]);

  const progress = request ? secondsLeft / REQUEST_TIMEOUT_SECONDS : 0;

  return {
    request,
    secondsLeft,
    progress,
    isResponding,
    error,
    accept,
    reject,
  };
}
