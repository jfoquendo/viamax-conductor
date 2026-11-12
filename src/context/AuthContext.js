// Sesión del conductor y estado de aprobación de la cuenta.
// Con Firebase configurado: Auth + Firestore en tiempo real.
// Sin Firebase: modo demo local (solo para desarrollo/pruebas).
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import {
  fetchDriverProfile,
  saveDriverRegistration,
  subscribeDriverProfile,
} from '../services/driverService';
import { getData, removeData, saveData, STORAGE_KEYS } from '../services/storage';

const AuthContext = createContext(null);

// Mensajes legibles para los errores de Firebase Auth.
const AUTH_MESSAGES = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña es demasiado débil (mínimo 6 caracteres).',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu red e inténtalo de nuevo.',
  'auth/operation-not-allowed': 'El inicio de sesión con correo no está habilitado en Firebase.',
  'permission-denied': 'No tienes permisos para esta operación. Revisa las reglas de Firestore.',
};

const getAuthErrorMessage = (error) => {
  const code = error?.code ?? '';
  return AUTH_MESSAGES[code] ?? error?.message ?? 'No se pudo completar la operación.';
};

// Clave local del modo demo (no se usa cuando Firebase está configurado).
const DEMO_SESSION_KEY = '@viamax_demo_session';

export function AuthProvider({ children }) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState(null);

  // 1) Sesión: Firebase Auth o sesión local de demostración.
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (fbUser) => {
          if (fbUser) {
            setUser({ uid: fbUser.uid, email: fbUser.email });
          } else {
            setUser(null);
            setProfile(null);
            setProfileLoaded(true);
          }
          setBootstrapping(false);
        },
        (authError) => {
          setError(getAuthErrorMessage(authError));
          setBootstrapping(false);
        }
      );
      return unsubscribe;
    }

    let mounted = true;
    (async () => {
      try {
        const session = await getData(DEMO_SESSION_KEY);
        const storedProfile = await getData(STORAGE_KEYS.driverProfile);
        if (mounted && session && storedProfile) {
          setUser(session);
          setProfile(storedProfile);
        }
      } catch (bootstrapError) {
        console.warn('[auth] Error leyendo sesión local:', bootstrapError?.message);
      } finally {
        if (mounted) {
          setProfileLoaded(true);
          setBootstrapping(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 2) Perfil del conductor: snapshot de Firestore o lectura local.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return () => {};
    }

    if (isFirebaseConfigured) {
      setProfileLoaded(false);
      return subscribeDriverProfile(
        user.uid,
        (data) => {
          setProfile(data);
          setProfileLoaded(true);
        },
        (snapshotError) => {
          setError(getAuthErrorMessage(snapshotError));
          setProfileLoaded(true);
        }
      );
    }

    let mounted = true;
    (async () => {
      const stored = await getData(STORAGE_KEYS.driverProfile);
      if (mounted) {
        setProfile(stored ?? null);
        setProfileLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  // 3) Estado derivado de la cuenta.
  const accountStatus = useMemo(() => {
    if (bootstrapping) return 'loading';
    if (!user) return 'signedOut';
    if (!profileLoaded) return 'loading';
    if (!profile) return 'missing';
    return profile.status || 'pending_approval';
  }, [bootstrapping, user, profileLoaded, profile]);

  const login = useCallback(async (email, password) => {
    setError(null);
    const cleanEmail = String(email ?? '').trim().toLowerCase();

    try {
      if (isFirebaseConfigured) {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        return;
      }

      // Modo demo: valida contra el perfil guardado en el dispositivo.
      const stored = await getData(STORAGE_KEYS.driverProfile);
      if (!stored) {
        throw new Error(
          'No hay ninguna cuenta en este dispositivo. Crea una cuenta para continuar.'
        );
      }
      const storedEmail = String(stored.personal?.email ?? stored.email ?? '').toLowerCase();
      if (storedEmail !== cleanEmail) {
        throw new Error('El correo no coincide con la cuenta registrada en este dispositivo.');
      }
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      const session = { uid: stored.uid || 'demo-driver', email: cleanEmail, isDemo: true };
      await saveData(DEMO_SESSION_KEY, session);
      setProfile(stored);
      setProfileLoaded(true);
      setUser(session);
    } catch (loginError) {
      const message = loginError?.code
        ? getAuthErrorMessage(loginError)
        : loginError.message;
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Crea la cuenta (si hace falta) y envía el registro al backend.
  // payload = { personal, vehicle, documents }
  const submitRegistration = useCallback(async (payload, password) => {
    setError(null);

    try {
      if (isFirebaseConfigured) {
        let currentUser = auth.currentUser;

        if (!currentUser) {
          const email = payload.personal.email.trim().toLowerCase();
          try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            currentUser = credential.user;
          } catch (createError) {
            // La cuenta ya existe: intenta iniciar sesión con la misma contraseña.
            if (createError?.code === 'auth/email-already-in-use') {
              const credential = await signInWithEmailAndPassword(auth, email, password);
              currentUser = credential.user;
            } else {
              throw createError;
            }
          }

          try {
            await updateAuthProfile(currentUser, { displayName: payload.personal.fullName });
          } catch (profileError) {
            console.warn('[auth] No se pudo actualizar displayName:', profileError?.message);
          }
        }

        const result = await saveDriverRegistration(
          currentUser.uid,
          currentUser.email,
          payload
        );

        // Actualización optimista: evita volver a la pantalla de registro
        // mientras llega el primer snapshot de Firestore.
        setProfile({
          ...payload,
          id: currentUser.uid,
          uid: currentUser.uid,
          email: currentUser.email,
          status: result?.status ?? 'pending_approval',
        });
        setProfileLoaded(true);
        return result;
      }

      // Modo demo local.
      const demoProfile = {
        ...payload,
        uid: 'demo-driver',
        email: payload.personal.email.trim().toLowerCase(),
        status: 'pending_approval',
        registeredAt: new Date().toISOString(),
      };
      await saveData(STORAGE_KEYS.driverProfile, demoProfile);

      const session = {
        uid: 'demo-driver',
        email: demoProfile.email,
        isDemo: true,
      };
      await saveData(DEMO_SESSION_KEY, session);

      setProfile(demoProfile);
      setProfileLoaded(true);
      setUser(session);
      return { status: 'pending_approval' };
    } catch (submitError) {
      const message = submitError?.code
        ? getAuthErrorMessage(submitError)
        : submitError.message;
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      await removeData(DEMO_SESSION_KEY);
      setUser(null);
      setProfile(null);
      setProfileLoaded(true);
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError));
      throw logoutError;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;

    if (isFirebaseConfigured) {
      const data = await fetchDriverProfile(user.uid);
      setProfile(data);
      setProfileLoaded(true);
      return data;
    }

    const stored = await getData(STORAGE_KEYS.driverProfile);
    setProfile(stored ?? null);
    setProfileLoaded(true);
    return stored;
  }, [user]);

  const simulateApproval = useCallback(async () => {
    if (isFirebaseConfigured) {
      // En el plan gratuito no hay Cloud Functions: se aprueba desde la consola.
      throw new Error(
        'Abre Firestore Console > drivers > tu documento y cambia status a "approved".'
      );
    }

    const updated = { ...(profile || {}), status: 'approved' };
    await saveData(STORAGE_KEYS.driverProfile, updated);
    setProfile(updated);
  }, [profile]);

  const value = useMemo(
    () => ({
      bootstrapping,
      user,
      profile,
      accountStatus,
      error,
      isDemo: !isFirebaseConfigured,
      isFirebaseConfigured,
      login,
      logout,
      submitRegistration,
      refreshProfile,
      simulateApproval,
      clearError: () => setError(null),
    }),
    [
      bootstrapping,
      user,
      profile,
      accountStatus,
      error,
      login,
      logout,
      submitRegistration,
      refreshProfile,
      simulateApproval,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
