// Pantalla Principal del Conductor — Mapa interactivo y navegación en tiempo real
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
import { mapDarkStyle } from '../../theme/mapDarkStyle';
import { getData, saveData, STORAGE_KEYS } from '../../services/storage';

export default function DriverHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  // Estados locales
  const [isAvailable, setIsAvailable] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);

  // Hook de GPS en tiempo real
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

  // Animar cámara cuando la posición cambia y está disponible
  useEffect(() => {
    if (isAvailable && mapRef.current && location) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        pitch: 35, // Vista ligeramente en perspectiva (estilo GPS)
        heading: location.heading || 0,
        zoom: 17,
      }, { duration: 1000 });
    }
  }, [location.latitude, location.longitude, isAvailable]);

  // Manejar cambio del switch Disponible / No disponible
  const handleToggleAvailability = async (value) => {
    // Si la cuenta está en pending_approval no puede ponerse disponible
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

    // Si se pone disponible, centramos la cámara de inmediato
    if (value && mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      }, 1000);
    }
  };

  // Botón para re-centrar el mapa manualmente
  const handleCenterLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        pitch: 20,
        heading: location.heading || 0,
        zoom: 16.5,
      }, { duration: 800 });
    }
  };

  return (
    <View style={styles.container}>
      {/* Mapa interactivo con tema oscuro */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        showsUserLocation={true}
        showsCompass={true}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          rotation={location.heading || 0}
        >
          <View style={[styles.markerContainer, isAvailable && styles.markerActive]}>
            <Ionicons
              name="navigate"
              size={22}
              color={isAvailable ? colors.textInverse : colors.text}
            />
          </View>
        </Marker>
      </MapView>

      {/* Cabecera flotante: Estado Disponible / Desconectado */}
      <View style={[styles.headerFloating, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerContent}>
          {/* Botón para abrir el menú lateral (Drawer) */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation?.openDrawer?.()}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>

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
            <Ionicons name="pulse" size={14} color={colors.primary} />
            <Text style={styles.trackingText}>GPS en vivo activo</Text>
          </View>
        )}
      </View>

      {/* Botón flotante para re-centrar el mapa */}
      <TouchableOpacity
        style={[styles.centerButton, { bottom: insets.bottom + 120 }]}
        onPress={handleCenterLocation}
      >
        <Ionicons name="locate" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Tarjeta inferior con resumen de turno del conductor */}
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
    width: '100%',
    height: '100%',
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
  menuButton: {
    padding: 4,
    marginRight: spacing.xs,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
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
    width: 38,
    height: 38,
    borderRadius: 19,
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