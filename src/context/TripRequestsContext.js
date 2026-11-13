import React, { createContext, useContext } from 'react';
import useTripRequests from '../hooks/useTripRequests';
import { useAuth } from './AuthContext';

const TripRequestsContext = createContext(null);

export function TripRequestsProvider({ children }) {
  const { user } = useAuth();

  const tripRequests = useTripRequests({
    enabled: Boolean(user?.uid),
    driverId: user?.uid,
  });

  return (
    <TripRequestsContext.Provider value={tripRequests}>
      {children}
    </TripRequestsContext.Provider>
  );
}

export function useTripRequestsContext() {
  const context = useContext(TripRequestsContext);

  if (!context) {
    throw new Error(
      'useTripRequestsContext debe usarse dentro de TripRequestsProvider'
    );
  }

  return context;
}