
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export const LOCATIONS_COLLECTION = 'driver_locations';

// Distancia mínima (metros) para considerar un movimiento relevante.
const MIN_DISTANCE_METERS = 8;
// Tiempo mínimo entre escrituras (ms) aunque el conductor se mueva.
const MIN_INTERVAL_MS = 8000;

let lastWrite = { at: 0, latitude: null, longitude: null };

// Distancia aproximada entre dos coordenadas (Haversine, sin dependencias).
function distanceMeters(from, to) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Decide si vale la pena escribir: evita llenar la cuota de escrituras.
export function shouldPublish(coords, now = Date.now()) {
  if (lastWrite.latitude === null) return true;
  const elapsed = now - lastWrite.at;
  if (elapsed < MIN_INTERVAL_MS) return false;
  const moved = distanceMeters(
    { latitude: lastWrite.latitude, longitude: lastWrite.longitude },
    coords
  );
  return moved >= MIN_DISTANCE_METERS;
}

// Publica posición y disponibilidad del conductor.
export async function publishDriverLocation(uid, coords, isAvailable) {
  if (!isFirebaseConfigured || !db || !uid) return false;

  const payload = {
    uid,
    latitude: coords.latitude,
    longitude: coords.longitude,
    heading: coords.heading ?? 0,
    speed: coords.speed ?? 0,
    accuracy: coords.accuracy ?? null,
    isAvailable: Boolean(isAvailable),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, LOCATIONS_COLLECTION, uid), payload, { merge: true });

  lastWrite = {
    at: Date.now(),
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
  return true;
}

export async function fetchDriverLocation(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  const snapshot = await getDoc(doc(db, LOCATIONS_COLLECTION, uid));
  return snapshot.exists() ? snapshot.data() : null;
}

// Permite reiniciar el estado interno al cambiar de sesión o de turno.
export function resetLocationThrottle() {
  lastWrite = { at: 0, latitude: null, longitude: null };
}
