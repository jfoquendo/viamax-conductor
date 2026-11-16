import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegistrationTabs from './RegistrationTabs';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

// Flujo sin sesión: login -> registro.
export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registration" component={RegistrationTabs} />
    </Stack.Navigator>
  );
}
