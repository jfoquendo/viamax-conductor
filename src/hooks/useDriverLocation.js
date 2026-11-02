import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
 
export default function useDriverLocation(isAvailable = false) {
  // Ubicación por defecto (Medellín)
  const [location, setLocation] = useState({
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
    heading: 0,
  });
 
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
 
  // Referencia para la suscripción de watchPositionAsync
  const locationSubscriptionRef = useRef(null);
 
  // Solicitar permisos de ubicación al montar el hook
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
          // Obtener la primera posición de inmediato
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
 
  // Seguimiento en tiempo real con watchPosition y cleanup estricto
  useEffect(() => {
    // Si no está disponible o no hay permisos, nos aseguramos de cancelar cualquier suscripción activa
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
            timeInterval: 4000,      // Actualizar cada 4 segundos
            distanceInterval: 5,     // O cada 5 metros recorridos
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
 
            // Aquí se llamaría a la sincronización con Firestore o API backend
            // syncLocationWithBackend({ latitude, longitude, heading });
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
 
    // FUNCIÓN DE LIMPIEZA OBLIGATORIA:
    // Se ejecuta al pasar a 'No disponible' o desmontar el componente
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
  };
}