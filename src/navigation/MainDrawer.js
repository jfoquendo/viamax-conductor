import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DriverHomeScreen from '../screens/home/DriverHomeScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import TripHistoryScreen from '../screens/history/TripHistoryScreen';
import DriverProfileScreen from '../screens/profile/DriverProfileScreen';
import TripRequestScreen from '../screens/trip/TripRequestScreen';
import { useAuth } from '../context/AuthContext';
import { TripRequestsProvider, useTripRequestsContext } from '../context/TripRequestsContext';
import { colors, radius, spacing, typography, shadows } from '../theme';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const { profile, user, logout } = useAuth();

  const fullName = profile?.personal?.fullName ?? 'Conductor ViaMax';
  const email = user?.email ?? profile?.email ?? '';
  const vehicle = [profile?.vehicle?.brand, profile?.vehicle?.model]
    .filter(Boolean)
    .join(' ');
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => logout().catch(() => { }),
      },
    ]);
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'V'}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {fullName}
          </Text>
          {email ? (
            <Text style={styles.email} numberOfLines={1}>
              {email}
            </Text>
          ) : null}
          {vehicle ? <Text style={styles.vehicle}>{vehicle}</Text> : null}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Conductor aprobado</Text>
          </View>
        </View>

        <View style={styles.items}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <TouchableOpacity
        style={[styles.logoutButton, { paddingBottom: insets.bottom + spacing.md }]}
        onPress={confirmLogout}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

function TripRequestBanner({ navigation }) {
  const { request, secondsLeft } = useTripRequestsContext();

  const currentRouteName = useNavigationState((state) => {
    if (!state) return null;
    return state.routes[state.index]?.name;
  });

  if (!request || currentRouteName === 'TripRequest') {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.requestBanner}
      onPress={() => navigation.navigate('TripRequest')}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Ver nueva solicitud de viaje"
    >
      <View style={styles.requestBannerIcon}>
        <Ionicons
          name="notifications"
          size={22}
          color={colors.textInverse}
        />
      </View>

      <View style={styles.requestBannerContent}>
        <Text style={styles.requestBannerTitle}>
          Nueva solicitud de viaje
        </Text>

        <Text style={styles.requestBannerText}>
          Tienes {secondsLeft}s para responder
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={colors.textInverse}
      />
    </TouchableOpacity>
  );
}

export default function MainDrawer() {
  return (
    <TripRequestsProvider>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenLayout={({ children, navigation }) => (
          <View style={styles.navigatorContainer}>
            {children}
            <TripRequestBanner navigation={navigation} />
          </View>
        )}
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
          name="TripRequest"
          component={TripRequestScreen}
          options={{
            title: 'Solicitudes',

            drawerIcon: ({ color, size }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
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
    </TripRequestsProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  drawerScroll: {
    paddingTop: 0,
  },
  profileHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  name: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
  },
  email: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  vehicle: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  items: {
    paddingTop: spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  navigatorContainer: {
    flex: 1,
  },
  requestBanner: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    top: spacing.md,
    zIndex: 100,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.card,
  },
  requestBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  requestBannerContent: {
    flex: 1,
  },
  requestBannerTitle: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
  requestBannerText: {
    color: colors.textInverse,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
});
