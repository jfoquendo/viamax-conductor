// Inicialización de Firebase para React Native.
// Sin variables EXPO_PUBLIC_FIREBASE_* la app arranca en modo demo local.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    try {
      const persistence =
        typeof getReactNativePersistence === 'function'
          ? getReactNativePersistence(AsyncStorage)
          : undefined;
      auth = persistence ? initializeAuth(app, { persistence }) : getAuth(app);
    } catch (authError) {
      // Si initializeAuth ya se ejecutó (Fast Refresh), reutiliza la instancia.
      auth = getAuth(app);
    }

    try {
      db = initializeFirestore(app, { experimentalForceLongPolling: true });
    } catch (firestoreError) {
      db = getFirestore(app);
    }
  } catch (error) {
    console.warn('[firebase] No se pudo inicializar:', error?.message ?? error);
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db };
export default firebaseConfig;
