// Punto de entrada principal de ViaMax Conductor
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RegistrationTabs from './src/navigation/RegistrationTabs';
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
      <RegistrationProvider>
        <NavigationContainer theme={appTheme}>
          <StatusBar style="light" />
          <RegistrationTabs />
        </NavigationContainer>
      </RegistrationProvider>
    </SafeAreaProvider>
  );
}