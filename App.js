import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { RegistrationProvider } from './src/context/RegistrationContext';
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
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RegistrationProvider>
          <NavigationContainer theme={appTheme}>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </RegistrationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
