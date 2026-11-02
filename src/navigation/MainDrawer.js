import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import DriverHomeScreen from '../screens/home/DriverHomeScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import TripHistoryScreen from '../screens/history/TripHistoryScreen';
import DriverProfileScreen from '../screens/profile/DriverProfileScreen';
import { colors } from '../theme';
 
const Drawer = createDrawerNavigator();
 
export default function MainDrawer() {
  return (
<Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.cardBackground,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        drawerStyle: {
          backgroundColor: colors.cardBackground,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSoft,
        drawerActiveBackgroundColor: colors.primarySoft,
      }}
>
<Drawer.Screen
        name="HomeDrawer"
        component={DriverHomeScreen}
        options={{
          title: 'Inicio / Turno',
          drawerIcon: ({ color, size }) => (
<Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
<Drawer.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          title: 'Ganancias',
          drawerIcon: ({ color, size }) => (
<Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
<Drawer.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{
          title: 'Historial de Viajes',
          drawerIcon: ({ color, size }) => (
<Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
<Drawer.Screen
        name="Profile"
        component={DriverProfileScreen}
        options={{
          title: 'Perfil y Ajustes',
          drawerIcon: ({ color, size }) => (
<Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
</Drawer.Navigator>
  );
}