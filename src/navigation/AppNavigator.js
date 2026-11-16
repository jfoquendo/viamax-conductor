import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActiveTripProvider, useActiveTrip } from '../context/ActiveTripContext';
import AuthNavigator from './AuthNavigator';
import MainDrawer from './MainDrawer';
import RegistrationTabs from './RegistrationTabs';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';
import TripActiveScreen from '../screens/trip/TripActiveScreen';
import TripSummaryScreen from '../screens/trip/TripSummaryScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

function Splash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function DriverNavigator() {
  const { activeTrip, isLoading } = useActiveTrip();
  const navigationRef = useRef(null);

  // El Drawer siempre vive en el stack. Cuando aparece un viaje activo se
  // monta TripActive encima; al terminar, se cierra y el conductor vuelve
  // al menu sin perder la sesion.
  useEffect(() => {
    if (isLoading) return;

    const nav = navigationRef.current;
    if (!nav) return;

    const current = nav.getCurrentRoute()?.name;

    if (activeTrip && current !== 'TripActive' && current !== 'TripSummary') {
      nav.navigate('TripActive', { tripId: activeTrip.id });
    }

    if (!activeTrip && (current === 'TripActive' || current === 'TripSummary')) {
      nav.navigate('MainDrawer');
    }
  }, [activeTrip, isLoading]);

  if (isLoading) {
    return <Splash />;
  }

  return (
    <Stack.Navigator
      ref={navigationRef}
      initialRouteName="MainDrawer"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="MainDrawer"
        component={MainDrawer}
      />

      <Stack.Screen
        name="TripActive"
        component={TripActiveScreen}
        options={{
          presentation: 'card',
          gestureEnabled: false,
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="TripSummary"
        component={TripSummaryScreen}
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

function DriverStack() {
  return (
    <ActiveTripProvider>
      <DriverNavigator />
    </ActiveTripProvider>
  );
}

// Puerta de entrada según el estado real de la cuenta:
// sin sesión -> login | sin perfil -> registro | pendiente -> espera | aprobado -> app.
export default function AppNavigator() {
  const { bootstrapping, accountStatus } = useAuth();

  if (bootstrapping || accountStatus === 'loading') return <Splash />;
  if (accountStatus === 'signedOut') return <AuthNavigator />;
  if (accountStatus === 'missing') return <RegistrationTabs />;
  if (accountStatus === 'approved') return <DriverStack />;
  return <PendingApprovalScreen />;
}
