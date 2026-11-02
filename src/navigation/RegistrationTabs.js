import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PersonalDataScreen from '../screens/registration/PersonalDataScreen';
import VehicleDataScreen from '../screens/registration/VehicleDataScreen';
import DocumentsScreen from '../screens/registration/DocumentsScreen';
import { colors } from '../theme';
 
const Tab = createBottomTabNavigator();
 
export default function RegistrationTabs() {
  return (
<Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
 
          if (route.name === 'PersonalData') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'VehicleData') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Documents') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }
 
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
>
<Tab.Screen
        name="PersonalData"
        component={PersonalDataScreen}
        options={{
          title: 'Datos Personales',
          tabBarLabel: 'Personal',
        }}
      />
<Tab.Screen
        name="VehicleData"
        component={VehicleDataScreen}
        options={{
          title: 'Datos del Vehículo',
          tabBarLabel: 'Vehículo',
        }}
      />
<Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          title: 'Documentos y Pagos',
          tabBarLabel: 'Documentos',
        }}
      />
</Tab.Navigator>
  );
}