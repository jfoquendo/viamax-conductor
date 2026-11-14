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

// Fuente de viajes: Firestore únicamente.

const firestoreSource = {
  name: 'firestore',

  // Escucha las solicitudes pendientes más recientes.
  subscribePending(onData, onError) {
    if (!isFirebaseConfigured || !db) return () => {};

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

  // Viajes cerrados del conductor, del mas reciente al mas antiguo.
  subscribeHistory(driverId, onData, onError) {
    if (!isFirebaseConfigured || !db || !driverId) {
      onData([]);
      return () => {};
    }

    const q = query(
      collection(db, TRIPS_COLLECTION),
      where('driverId', '==', driverId),
      where('status', 'in', [TRIP_STATUS.COMPLETED, TRIP_STATUS.PAID]),
      orderBy('completedAt', 'desc'),
      limit(100)
    );

    return onSnapshot(
      q,
      (snapshot) => onData(snapshot.docs.map(toTrip)),
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

// Fuente de datos de viajes: Firestore.
export const tripSource = firestoreSource;
