import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import RegistrationTabs from './RegistrationTabs';
import MainDrawer from './MainDrawer';
import { getData, STORAGE_KEYS } from '../services/storage';
import { colors } from '../theme';
import { useRegistration } from '../context/RegistrationContext';
 
export default function AppNavigator() {
  const { registrationCompleted } = useRegistration();
  const [isLoading, setIsLoading] = useState(true);
  const [hasRegisteredProfile, setHasRegisteredProfile] = useState(false);
 
  // Comprueba si el conductor ya completó su registro
  const checkDriverStatus = async () => {
    try {
      const profile = await getData(STORAGE_KEYS.driverProfile);
      setHasRegisteredProfile(Boolean(profile));
    } catch (error) {
      console.error('Error comprobando perfil de conductor:', error);
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    checkDriverStatus();
  }, []);
 
  if (isLoading) {
    return (
<View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
<ActivityIndicator size="large" color={colors.primary} />
</View>
    );
  }
 
  // Si ya se registró, entra a la app con el Drawer (Home, Ganancias, etc.)
  // Si no se ha registrado, muestra las pestañas de registro
  return (hasRegisteredProfile || registrationCompleted) ? <MainDrawer /> : <RegistrationTabs />;
}