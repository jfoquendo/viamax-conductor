import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

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

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return {
      token: null,
      status: 'missing-project-id',
    };
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return {
    token: tokenResponse.data,
    status: 'granted',
  };
}