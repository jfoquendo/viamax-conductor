import React from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PersonalDataScreen from '../screens/registration/PersonalDataScreen';
import VehicleDataScreen from '../screens/registration/VehicleDataScreen';
import DocumentsScreen from '../screens/registration/DocumentsScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

// Barra de pestañas oculta: la navegación se hace con Anterior/Siguiente.
// Los pasos siguen siendo tabs para conservar el estado entre pestañas.
export default function RegistrationTabs() {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir del registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Tab.Navigator
      backBehavior="order"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
        },
        headerRight:
          user != null
            ? () => (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={confirmLogout}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar sesión"
                >
                  <Ionicons name="log-out-outline" size={22} color={colors.textSoft} />
                </TouchableOpacity>
              )
            : undefined,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen
        name="PersonalData"
        component={PersonalDataScreen}
        options={{ title: 'Datos Personales' }}
      />
      <Tab.Screen
        name="VehicleData"
        component={VehicleDataScreen}
        options={{ title: 'Datos del Vehículo' }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: 'Documentos y Pagos' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 16,
    padding: 4,
  },
});
