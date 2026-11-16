import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { RegistrationProvider } from './src/context/RegistrationContext';
import { listenToNotificationTap } from './src/services/notificationService';
import { colors } from './src/theme';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.cardBackground,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  const navigationRef = useRef(null);

  // Al tocar una notificación de solicitud, se abre la bandeja de solicitudes.
  useEffect(() => {
    const unsubscribe = listenToNotificationTap((data) => {
      const nav = navigationRef.current;
      if (!nav) return;

      if (data?.tripId) {
        nav.navigate('MainDrawer', { screen: 'TripRequest' });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RegistrationProvider>
          <NavigationContainer theme={appTheme} ref={navigationRef}>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </RegistrationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
