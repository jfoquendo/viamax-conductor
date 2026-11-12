// Acceso al documento del conductor en Firestore.
// Plan Spark (gratuito): NO se usan Cloud Functions.
// La seguridad se aplica con reglas de Firestore:
//  - el conductor solo lee/escribe su propio documento;
//  - el campo "status" no puede cambiar desde el cliente;
//  - la aprobación se hace desde la consola de Firebase (bypass de reglas).
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export const DRIVERS_COLLECTION = 'drivers';

// Escucha el perfil en tiempo real. Devuelve la función de limpieza.
export function subscribeDriverProfile(uid, onData, onError) {
  if (!isFirebaseConfigured || !db || !uid) return () => {};

  const ref = doc(db, DRIVERS_COLLECTION, uid);
  return onSnapshot(
    ref,
    (snapshot) => {
      onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function fetchDriverProfile(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  const snapshot = await getDoc(doc(db, DRIVERS_COLLECTION, uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

function requiresTechReview(vehicle) {
  const year = Number.parseInt(vehicle?.year, 10);
  if (!Number.isFinite(year)) return false;
  return new Date().getFullYear() - year >= 5;
}

// Guarda el registro directamente en Firestore con status pendiente.
// Las reglas impiden que el cliente escriba cualquier otro estado.
export async function saveDriverRegistration(uid, email, payload) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado.');
  }

  const ref = doc(db, DRIVERS_COLLECTION, uid);
  const existing = await getDoc(ref);

  if (existing.exists() && existing.get('status') === 'approved') {
    const error = new Error('Esta cuenta ya fue aprobada.');
    error.code = 'app/already-approved';
    throw error;
  }

  const now = serverTimestamp();
  const document = {
    uid,
    email,
    personal: payload.personal,
    vehicle: payload.vehicle,
    documents: payload.documents,
    requiresTechReview: requiresTechReview(payload.vehicle),
    status: 'pending_approval',
    updatedAt: now,
  };

  // createdAt solo en el primer envío: las reglas no permiten reescribirlo.
  if (!existing.exists()) {
    document.createdAt = now;
  }

  await setDoc(ref, document, { merge: true });

  return { status: 'pending_approval', requiresTechReview: document.requiresTechReview };
}
