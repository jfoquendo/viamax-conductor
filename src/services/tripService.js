// Acceso a los viajes.
// La fuente de datos está detrás de un adaptador para poder cambiar de
// Firestore a la API del curso sin tocar las pantallas ni los hooks.
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { TRIP_STATUS } from '../config/trips';

export const TRIPS_COLLECTION = 'trips';

// Normaliza un documento de Firestore a un objeto plano con id.
const toTrip = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

// Crea una solicitud de viaje local (para pruebas mientras llega la API).
export function buildDemoRequest(overrides = {}) {
  return {
    id: `demo-${Date.now()}`,
    passengerName: 'Pasajero de prueba',
    origin: { address: 'Parque Lleras, Medellín', latitude: 6.2092, longitude: -75.5674 },
    destination: { address: 'Aeropuerto José María Córdova', latitude: 6.1645, longitude: -75.4231 },
    distanceKm: 8.5,
    durationMin: 22,
    category: 'economy',
    paymentMethod: 'cash',
    tip: 0,
    status: TRIP_STATUS.REQUESTED,
    requestedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Adaptadores. Cada uno expone subscribePending(handler) y responde a las
// acciones del conductor. El de Firestore es el que usa la app conectada;
// el local sirve para probar el flujo sin backend y para la demo.
// ---------------------------------------------------------------------------

const firestoreSource = {
  name: 'firestore',

  // Escucha las solicitudes pendientes más recientes.
  subscribePending(onData, onError) {
    if (!isFirebaseConfigured || !db) return () => { };

    const q = query(
      collection(db, TRIPS_COLLECTION),
      where('status', '==', TRIP_STATUS.REQUESTED),
      orderBy('requestedAt', 'asc'),
      limit(10)
    );

    return onSnapshot(
      q,
      (snapshot) => onData(snapshot.docs.map(toTrip)),
      (error) => onError?.(error)
    );
  },

  subscribeActive(driverId, onData, onError) {
    if (!isFirebaseConfigured || !db || !driverId) {
      onData(null);
      return () => { };
    }

    const q = query(
      collection(db, TRIPS_COLLECTION),
      where('driverId', '==', driverId),
      where('status', 'in', [
        TRIP_STATUS.ACCEPTED,
        TRIP_STATUS.DRIVER_ARRIVING,
        TRIP_STATUS.IN_PROGRESS,
      ]),
      limit(1)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const activeTrip = snapshot.empty ? null : toTrip(snapshot.docs[0]);
        onData(activeTrip);
      },
      (error) => onError?.(error)
    );
  },


  async accept(tripId, driverId) {
    await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
      status: TRIP_STATUS.ACCEPTED,
      driverId,
      acceptedAt: serverTimestamp(),
    });
  },

  async reject(tripId) {
    // La solicitud no se reasigna desde el cliente: se marca para el dispatch.
    await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
      status: TRIP_STATUS.CANCELLED,
      cancelledAt: serverTimestamp(),
      cancelledBy: 'driver',
    });
  },

  async advance(tripId, status, extra = {}) {
    await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
      ...extra,
      status,
      updatedAt: serverTimestamp(),
    });
  },

  async fetch(tripId) {
    const snapshot = await getDoc(doc(db, TRIPS_COLLECTION, tripId));
    return snapshot.exists() ? toTrip(snapshot) : null;
  },
};

// Adaptador en memoria: simula el envío de una solicitud.
export function createLocalSource() {
  let listeners = new Set();
  let current = null;

  const emit = () => listeners.forEach((fn) => fn(current ? [current] : []));

  return {
    name: 'local',

    subscribePending(onData) {
      const handler = (data) => onData(data);
      listeners.add(handler);
      emit();
      return () => listeners.delete(handler);
    },

    subscribeActive(driverId, onData) {
      const handler = (data) => {
        const trip = data.find(
          (item) =>
            item.driverId === driverId &&
            [
              TRIP_STATUS.ACCEPTED,
              TRIP_STATUS.DRIVER_ARRIVING,
              TRIP_STATUS.IN_PROGRESS,
            ].includes(item.status)
        );

        onData(trip ?? null);
      };

      listeners.add(handler);
      emit();

      return () => listeners.delete(handler);
    },

    // Simula que llega una solicitud nueva.
    simulateIncoming(overrides) {
      current = buildDemoRequest(overrides);
      emit();
      return current;
    },

    async accept(tripId, driverId) {
      current = { ...current, id: tripId, status: TRIP_STATUS.ACCEPTED, driverId };
      emit();
    },

    async reject() {
      current = null;
      emit();
    },

    async advance(tripId, status, extra = {}) {
      current = { ...current, status, ...extra };
      emit();
    },

    async fetch(tripId) {
      return current && current.id === tripId ? current : null;
    },
  };
}

// Fuente activa: Firestore si hay configuración, local en caso contrario.
export const tripSource = isFirebaseConfigured ? firestoreSource : createLocalSource();
