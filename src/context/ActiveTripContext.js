import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { tripSource } from '../services/tripService';

const ActiveTripContext = createContext(null);

export function ActiveTripProvider({ children }) {
  const { user } = useAuth();

  const [activeTrip, setActiveTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setActiveTrip(null);
      setIsLoading(false);
      setError(null);
      return () => {};
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = tripSource.subscribeActive(
      user.uid,
      (trip) => {
        setActiveTrip(trip);
        setIsLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        setActiveTrip(null);
        setIsLoading(false);
        setError(
          subscriptionError?.message ??
            'No se pudo consultar el viaje activo'
        );
      }
    );

    return unsubscribe;
  }, [user?.uid, refreshKey]);

  return (
    <ActiveTripContext.Provider
      value={{
        activeTrip,
        isLoading,
        error,
        refresh,
      }}
    >
      {children}
    </ActiveTripContext.Provider>
  );
}

export function useActiveTrip() {
  const context = useContext(ActiveTripContext);

  if (!context) {
    throw new Error(
      'useActiveTrip debe usarse dentro de ActiveTripProvider'
    );
  }

  return context;
}