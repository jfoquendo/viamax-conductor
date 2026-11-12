import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainDrawer from './MainDrawer';
import RegistrationTabs from './RegistrationTabs';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';
import TripActiveScreen from '../screens/trip/TripActiveScreen';
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

function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainDrawer" component={MainDrawer} />
      <Stack.Screen
        name="TripActive"
        component={TripActiveScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
    </Stack.Navigator>
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
