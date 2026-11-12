import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { publishDriverLocation, shouldPublish } from '../services/locationService';

// Ubicación inicial mientras llega el GPS (Medellín).
const DEFAULT_LOCATION = {
  latitude: 6.2442,
  longitude: -75.5812,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
  heading: 0,
};

export default function useDriverLocation(isAvailable = false) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);

  const locationSubscriptionRef = useRef(null);

  // Pide permisos y obtiene la primera posición al montar.
  useEffect(() => {
    let isMounted = true;

    async function requestPermissions() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setErrorMessage('Permiso de ubicación denegado por el usuario');
            setHasPermission(false);
          }
          return;
        }

        if (isMounted) {
          setHasPermission(true);
          const initialPos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          setLocation((prev) => ({
            ...prev,
            latitude: initialPos.coords.latitude,
            longitude: initialPos.coords.longitude,
            heading: initialPos.coords.heading || 0,
          }));
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage('Error al solicitar permisos de GPS: ' + error.message);
        }
      }
    }

    requestPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Envía la posición al servidor solo si el conductor está disponible
  // y si el movimiento supera el umbral definido en el servicio.
  const syncLocation = useCallback(
    async (coords, uid) => {
      if (!uid || !shouldPublish(coords)) return;
      try {
        const written = await publishDriverLocation(uid, coords, true);
        if (written) setLastSyncAt(Date.now());
      } catch (error) {
        setErrorMessage('No se pudo sincronizar la ubicación: ' + error.message);
      }
    },
    []
  );

  // Seguimiento en tiempo real 
  useEffect(() => {
    if (!isAvailable || !hasPermission) {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
        setIsTracking(false);
      }
      return;
    }

    let isSubscribed = true;

    async function startLocationWatch() {
      try {
        setIsTracking(true);

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000,
            distanceInterval: 5,
          },
          (newLocation) => {
            if (!isSubscribed) return;

            const { latitude, longitude, heading } = newLocation.coords;
            setLocation((prev) => ({
              ...prev,
              latitude,
              longitude,
              heading: heading || prev.heading,
            }));
          }
        );

        locationSubscriptionRef.current = subscription;
      } catch (err) {
        if (isSubscribed) {
          setErrorMessage('Error al iniciar rastreo de ubicación: ' + err.message);
          setIsTracking(false);
        }
      }
    }

    startLocationWatch();

    return () => {
      isSubscribed = false;
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
        setIsTracking(false);
      }
    };
  }, [isAvailable, hasPermission]);

  return {
    location,
    hasPermission,
    errorMessage,
    isTracking,
    lastSyncAt,
    syncLocation,
  };
}
