// Mapa de viaje con la ruta dibujada.
// Reutilizable: lo usan el viaje activo y, más adelante, el detalle del historial.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { fetchRoute } from '../../services/routeService';
import { colors, radius, spacing, typography } from '../../theme';

// Ajusta el encuadre para que la ruta completa quede visible.
function regionForRoute(points, fallbackOrigin) {
  if (!points || points.length < 2) {
    return {
      latitude: fallbackOrigin?.latitude ?? 6.2442,
      longitude: fallbackOrigin?.longitude ?? -75.5812,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.005),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.005),
  };
}

export default function TripMapCard({
  origin,
  destination,
  driverLocation,
  height = 240,
  onRouteLoaded,
}) {
  const mapRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pide la ruta cuando cambian los extremos.
  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!origin || !destination) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchRoute(origin, destination);
        if (isMounted) {
          setRoute(result);
          onRouteLoaded?.(result);
        }
      } catch (routeError) {
        if (isMounted) {
          setError(
            routeError?.code === 'app/missing-key'
              ? 'Configura GOOGLE_MAPS_API_KEY para ver la ruta'
              : 'No se pudo calcular la ruta'
          );
          setRoute(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [origin?.latitude, origin?.longitude, destination?.latitude, destination?.longitude]);

  // Encuadra la ruta una vez calculada.
  const fitToRoute = useCallback(() => {
    if (mapRef.current && route?.points?.length > 1) {
      mapRef.current.fitToCoordinates(route.points, {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: true,
      });
    }
  }, [route]);

  useEffect(() => {
    fitToRoute();
  }, [fitToRoute]);

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={regionForRoute(route?.points, origin)}
        showsUserLocation={Boolean(driverLocation)}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {route?.points?.length > 1 ? (
          <Polyline
            coordinates={route.points}
            strokeWidth={5}
            strokeColor={colors.primary}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}

        {origin ? (
          <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.markerOrigin} />
          </Marker>
        ) : null}

        {destination ? (
          <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.markerDestination} />
          </Marker>
        ) : null}
      </MapView>

      {isLoading ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.overlayText}>Calculando ruta…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBadge}>
          <Ionicons name="warning-outline" size={14} color={colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {route ? (
        <View style={styles.metricsBadge}>
          <Text style={styles.metricsText}>
            {route.distanceKm} km · {route.durationMin} min
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerOrigin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.textInverse,
  },
  markerDestination: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.textInverse,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  overlayText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  errorBadge: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  errorText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  metricsBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricsText: {
    ...typography.label,
    color: colors.text,
    fontSize: 11,
  },
});
