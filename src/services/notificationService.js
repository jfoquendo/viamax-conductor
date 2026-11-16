import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Comportamiento cuando llega una notificacion con la app abierta:
// se muestra el banner en lugar de silenciarse.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Escucha cuando el conductor toca una notificacion.
// Devuelve la funcion para suspender la escucha.
export function listenToNotificationTap(onTap) {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response?.notification?.request?.content?.data ?? {};
      onTap?.(data);
    }
  );

  return () => subscription.remove();
}

// Canal usado para solicitudes de viaje en Android.
export async function configureNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('trip-requests', {
    name: 'Solicitudes de viaje',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
}

// Solicita permiso y obtiene el token push del dispositivo.
export async function registerForPushNotifications() {
  await configureNotificationChannel();

  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    return {
      token: null,
      status,
    };
  }

  // Token nativo de FCM. En Expo Go no existe, por eso se captura el error
  // y se devuelve un estado comprensible en lugar de romper la pantalla.
  try {
    const tokenResponse = await Notifications.getDevicePushTokenAsync();

    return {
      token: tokenResponse?.data ?? null,
      status: 'granted',
    };
  } catch (tokenError) {
    return {
      token: null,
      status: 'unavailable',
      reason: tokenError?.message ?? 'No se pudo obtener el token',
    };
  }
}