import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useDriverLocation from '../../hooks/useDriverLocation';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { getData, saveData, STORAGE_KEYS } from '../../services/storage';
 
export default function DriverHomeScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
 
  // Estados locales
  const [isAvailable, setIsAvailable] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
 
  // Hook personalizado de ubicación GPS
  const { location, hasPermission, isTracking } = useDriverLocation(isAvailable);
 
  // Cargar estado inicial y perfil guardado
  useEffect(() => {
    async function loadInitialData() {
      const savedAvailability = await getData(STORAGE_KEYS.isAvailable);
      const savedProfile = await getData(STORAGE_KEYS.driverProfile);
 
      if (savedAvailability !== null) {
        setIsAvailable(savedAvailability);
      }
      setDriverProfile(savedProfile);
    }
 
    loadInitialData();
  }, []);
 
  // Manejar cambio del switch Disponible / No disponible
  const handleToggleAvailability = async (value) => {
    // Validación de negocio: solo si el estado es 'approved' puede ponerse disponible
    if (value && driverProfile && driverProfile.status === 'pending_approval') {
      Alert.alert(
        'Cuenta Pendiente de Aprobación',
        'Tu registro aún está en proceso de revisión por el equipo de ViaMax. No puedes ponerte disponible hasta que sea aprobado.',
        [
          { text: 'Entendido' },
          {
            text: 'Simular Aprobación',
            style: 'destructive',
            onPress: async () => {
              const updatedProfile = { ...driverProfile, status: 'approved' };
              await saveData(STORAGE_KEYS.driverProfile, updatedProfile);
              setDriverProfile(updatedProfile);
              setIsAvailable(true);
              await saveData(STORAGE_KEYS.isAvailable, true);
            },
          },
        ]
      );
      return;
    }
 
    setIsAvailable(value);
    await saveData(STORAGE_KEYS.isAvailable, value);
  };
 
  // Centrar mapa en la posición actual
  const handleCenterLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        1000
      );
    }
  };
 
  return (
<View style={styles.container}>
<MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={location}
        showsCompass={false}
        showsMyLocationButton={false}
>
<Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          rotation={location.heading}
>
<View style={[styles.markerContainer, isAvailable && styles.markerActive]}>
<Ionicons name="car" size={24} color={isAvailable ? colors.textInverse : colors.text} />
</View>
</Marker>
</MapView>

<View style={[styles.headerFloating, { paddingTop: insets.top + spacing.sm }]}>
<View style={styles.headerContent}>
<View style={styles.statusIndicatorRow}>
<View
              style={[
                styles.statusDot,
                isAvailable ? styles.statusDotOnline : styles.statusDotOffline,
              ]}
            />
<Text style={styles.statusText}>
              {isAvailable ? 'Estás Disponible' : 'Desconectado'}
</Text>
</View>
 
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: colors.borderLight, true: colors.primarySoft }}
            thumbColor={isAvailable ? colors.primary : colors.textSoft}
          />
</View>
 
        {isTracking && (
<View style={styles.trackingBanner}>
<Ionicons name="navigate" size={14} color={colors.primary} />
<Text style={styles.trackingText}>Transmitiendo GPS en tiempo real</Text>
</View>
        )}
</View>

<TouchableOpacity
        style={[styles.centerButton, { bottom: insets.bottom + 120 }]}
        onPress={handleCenterLocation}
>
<Ionicons name="locate" size={24} color={colors.text} />
</TouchableOpacity>

<View style={[styles.bottomCard, { paddingBottom: insets.bottom + spacing.md }]}>
<View style={styles.metricRow}>
<View style={styles.metricItem}>
<Text style={styles.metricLabel}>Viajes hoy</Text>
<Text style={styles.metricValue}>0</Text>
</View>
<View style={styles.metricDivider} />
<View style={styles.metricItem}>
<Text style={styles.metricLabel}>Ganancias hoy</Text>
<Text style={[styles.metricValue, { color: colors.primary }]}>$0 COP</Text>
</View>
<View style={styles.metricDivider} />
<View style={styles.metricItem}>
<Text style={styles.metricLabel}>Horas activo</Text>
<Text style={styles.metricValue}>{isAvailable ? '0.1 h' : '0.0 h'}</Text>
</View>
</View>
</View>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerFloating: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  headerContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotOnline: {
    backgroundColor: colors.primary,
  },
  statusDotOffline: {
    backgroundColor: colors.textSoft,
  },
  statusText: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
  },
  trackingBanner: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackingText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  centerButton: {
    position: 'absolute',
    right: spacing.lg,
    backgroundColor: colors.cardBackground,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  markerContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textSoft,
    ...shadows.card,
  },
  markerActive: {
    backgroundColor: colors.primary,
    borderColor: colors.text,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadows.modal,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.label,
    fontSize: 11,
    color: colors.textSoft,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
});