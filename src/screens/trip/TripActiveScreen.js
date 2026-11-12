import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { tripSource } from '../../services/tripService';
import { calculateFare } from '../../utils/calculateFare';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  TRIP_STATUS,
  TRIP_STATUS_LABELS,
} from '../../config/trips';
import { colors, radius, spacing, typography, shadows } from '../../theme';
import TripMapCard from '../../components/maps/TripMapCard';

const formatCOP = (value) =>
  '$' + Math.round(Number(value) || 0).toLocaleString('es-CO') + ' COP';

// Siguiente paso del viaje y texto del botón principal.
const NEXT_STEP = {
  [TRIP_STATUS.ACCEPTED]: { status: TRIP_STATUS.DRIVER_ARRIVING, label: 'Voy en camino' },
  [TRIP_STATUS.DRIVER_ARRIVING]: { status: TRIP_STATUS.IN_PROGRESS, label: 'Iniciar viaje' },
  [TRIP_STATUS.IN_PROGRESS]: { status: TRIP_STATUS.COMPLETED, label: 'Finalizar viaje' },
};

export default function TripActiveScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const tripId = route?.params?.tripId;

  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState(null);
  const [liveRoute, setLiveRoute] = useState(null);

  const category = profile?.vehicle?.category ?? 'economy';

  // Carga el viaje y se mantiene al día con los cambios de estado.
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = tripId ? await tripSource.fetch(tripId) : null;
        if (isMounted) setTrip(data);
      } catch (loadError) {
        if (isMounted) setError(loadError?.message ?? 'No se pudo cargar el viaje');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [tripId]);

  const fare = useMemo(() => {
    if (!trip) return null;
    return calculateFare({
      distanceKm: liveRoute?.distanceKm ?? trip.distanceKm,
      durationMin: liveRoute?.durationMin ?? trip.durationMin,
      category: trip.category ?? category,
      tip: trip.tip ?? 0,
    });
  }, [trip, category, liveRoute]);

  const currentStatus = trip?.status ?? TRIP_STATUS.ACCEPTED;
  const next = NEXT_STEP[currentStatus];

  const advance = useCallback(async () => {
    if (!next || !trip) return;

    setIsWorking(true);
    setError(null);
    try {
      await tripSource.advance(trip.id, next.status);
      const updated = { ...trip, status: next.status };
      setTrip(updated);

      if (next.status === TRIP_STATUS.COMPLETED) {
        navigation?.replace?.('TripSummary', { tripId: trip.id, fare });
      }
    } catch (advanceError) {
      setError(advanceError?.message ?? 'No se pudo actualizar el viaje');
    } finally {
      setIsWorking(false);
    }
  }, [next, trip, navigation, fare]);

  const confirmCancel = () => {
    Alert.alert(
      'Cancelar viaje',
      '¿Seguro que quieres cancelar este viaje?',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Cancelar viaje',
          style: 'destructive',
          onPress: async () => {
            try {
              await tripSource.reject(trip.id);
              navigation?.goBack?.();
            } catch (cancelError) {
              setError(cancelError?.message ?? 'No se pudo cancelar');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.centered, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Ionicons name="alert-circle-outline" size={44} color={colors.textSoft} />
        <Text style={styles.emptyTitle}>No hay viaje activo</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.secondaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{TRIP_STATUS_LABELS[currentStatus]}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={confirmCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancelar viaje"
        >
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TripMapCard
          origin={trip.origin}
          destination={trip.destination}
          onRouteLoaded={setLiveRoute}
        />

        <View style={styles.card}>
          <Text style={styles.blockLabel}>Pasajero</Text>
          <Text style={styles.passenger}>{trip.passengerName ?? 'Pasajero'}</Text>

          <View style={styles.divider} />

          <View style={styles.routeRow}>
            <View style={styles.routeDots}>
              <View style={styles.dotOrigin} />
              <View style={styles.routeLine} />
              <View style={styles.dotDestination} />
            </View>
            <View style={styles.routeTexts}>
              <Text style={styles.blockLabel}>Recogida</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>
                {trip.origin?.address}
              </Text>
              <Text style={[styles.blockLabel, { marginTop: spacing.md }]}>Destino</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>
                {trip.destination?.address}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.blockLabel}>Distancia</Text>
              <Text style={styles.metricValue}>{trip.distanceKm} km</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.blockLabel}>Duración</Text>
              <Text style={styles.metricValue}>{trip.durationMin} min</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <Text style={styles.blockLabel}>Pago</Text>
              <Text style={styles.metricValue}>
                {PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? 'Efectivo'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.blockLabel}>Ganancia al finalizar</Text>
          <Text style={styles.earnings}>{fare ? formatCOP(fare.driverEarnings) : '—'}</Text>
          <Text style={styles.earningsDetail}>
            Tarifa {fare ? formatCOP(fare.fare) : '—'} · comisión{' '}
            {fare ? formatCOP(fare.commission) : '—'}
          </Text>

          {trip.paymentMethod === PAYMENT_METHODS.CASH && fare ? (
            <View style={styles.cashNotice}>
              <Ionicons name="cash-outline" size={16} color={colors.warning} />
              <Text style={styles.cashText}>
                Cobra {formatCOP(fare.total)} en efectivo al pasajero.
              </Text>
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.secondaryButtonSmall}
          onPress={() => navigation?.openDrawer?.() ?? navigation?.goBack?.()}
          disabled={isWorking}
        >
          <Ionicons name="menu" size={20} color={colors.textSoft} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={advance}
          disabled={isWorking || !next}
          accessibilityRole="button"
          accessibilityLabel={next?.label ?? 'Acción'}
        >
          {isWorking ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>{next?.label ?? 'Viaje finalizado'}</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.subtitle,
    fontSize: 18,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  blockLabel: {
    ...typography.label,
    color: colors.textSoft,
    marginBottom: 4,
  },
  passenger: {
    ...typography.subtitle,
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  routeDots: {
    alignItems: 'center',
    paddingTop: 4,
    width: 16,
  },
  dotOrigin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.danger,
  },
  routeTexts: {
    flex: 1,
  },
  routeAddress: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  metricValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  earnings: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  earningsDetail: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  cashNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cashText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  secondaryButtonSmall: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});