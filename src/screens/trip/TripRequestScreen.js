import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTripRequests from '../../hooks/useTripRequests';
import { useAuth } from '../../context/AuthContext';
import { calculateFare } from '../../utils/calculateFare';
import { tripSource } from '../../services/tripService';
import { PAYMENT_METHOD_LABELS, TRIP_STATUS } from '../../config/trips';
import { colors, radius, spacing, typography, shadows } from '../../theme';

const formatCOP = (value) =>
  '$' + Math.round(Number(value) || 0).toLocaleString('es-CO') + ' COP';

export default function TripRequestScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const isDemo = tripSource.name === 'local';
  const [simulated, setSimulated] = useState(null);

  const { request, secondsLeft, progress, isResponding, error, accept, reject } =
    useTripRequests({
      enabled: Boolean(user?.uid),
      driverId: user?.uid,
    });

  const category = profile?.vehicle?.category ?? 'economy';

  const fare = request
    ? calculateFare({
        distanceKm: request.distanceKm,
        durationMin: request.durationMin,
        category,
        tip: request.tip ?? 0,
      })
    : null;

  const handleAccept = useCallback(async () => {
    const accepted = await accept();
    if (accepted) {
      navigation?.navigate?.('TripActive', { tripId: accepted.id });
    }
  }, [accept, navigation]);

  const handleSimulate = () => {
    if (isDemo && typeof tripSource.simulateIncoming === 'function') {
      setSimulated(tripSource.simulateIncoming());
    }
  };

  useEffect(() => {
    if (!request) setSimulated(null);
  }, [request]);

  if (!request) {
    return (
      <View style={[styles.emptyContainer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.emptyBadge}>
          <Ionicons name="hourglass-outline" size={40} color={colors.textSoft} />
        </View>
        <Text style={styles.emptyTitle}>Esperando solicitudes</Text>
        <Text style={styles.emptyText}>
          Mantén el turno activo en la pantalla principal para recibir viajes cercanos.
        </Text>

        {isDemo ? (
          <TouchableOpacity style={styles.demoButton} onPress={handleSimulate}>
            <Ionicons name="flask-outline" size={18} color={colors.warning} />
            <Text style={styles.demoText}>Simular solicitud (modo local)</Text>
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.timerRow}>
        <View style={styles.timerTrack}>
          <View style={[styles.timerFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <Text style={styles.timerText}>{secondsLeft}s</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{request.category?.toUpperCase() ?? 'ECONOMY'}</Text>
          </View>
          <View style={styles.pillNeutral}>
            <Text style={styles.pillNeutralText}>
              {PAYMENT_METHOD_LABELS[request.paymentMethod] ?? 'Efectivo'}
            </Text>
          </View>
        </View>

        <Text style={styles.passenger}>{request.passengerName ?? 'Pasajero'}</Text>

        <View style={styles.routeRow}>
          <View style={styles.routeDots}>
            <View style={styles.dotOrigin} />
            <View style={styles.routeLine} />
            <View style={styles.dotDestination} />
          </View>
          <View style={styles.routeTexts}>
            <Text style={styles.routeLabel}>Recogida</Text>
            <Text style={styles.routeAddress} numberOfLines={2}>
              {request.origin?.address}
            </Text>
            <Text style={[styles.routeLabel, { marginTop: spacing.sm }]}>Destino</Text>
            <Text style={styles.routeAddress} numberOfLines={2}>
              {request.destination?.address}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Ionicons name="speedometer-outline" size={16} color={colors.textSoft} />
            <Text style={styles.metricValue}>{request.distanceKm} km</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="time-outline" size={16} color={colors.textSoft} />
            <Text style={styles.metricValue}>{request.durationMin} min</Text>
          </View>
          <View style={styles.metric}>
            <Ionicons name="navigate-outline" size={16} color={colors.textSoft} />
            <Text style={styles.metricValue}>
              {TRIP_STATUS.REQUESTED === request.status ? 'Disponible' : request.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Ganancia estimada</Text>
          <Text style={styles.earningsValue}>{fare ? formatCOP(fare.driverEarnings) : '—'}</Text>
        </View>
        <Text style={styles.earningsDetail}>
          Tarifa {fare ? formatCOP(fare.fare) : '—'} · comisión{' '}
          {fare ? formatCOP(fare.commission) : '—'}
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={reject}
          disabled={isResponding}
          accessibilityRole="button"
          accessibilityLabel="Rechazar viaje"
        >
          <Ionicons name="close" size={26} color={colors.danger} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          disabled={isResponding}
          accessibilityRole="button"
          accessibilityLabel="Aceptar viaje"
        >
          {isResponding ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="checkmark" size={22} color={colors.textInverse} />
              <Text style={styles.acceptText}>Aceptar viaje</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {simulated ? (
        <Text style={styles.demoNote}>
          Solicitud simulada localmente. Se conectará a la API del curso cuando esté disponible.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSoft,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
  },
  demoText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '700',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  timerTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timerText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    width: 36,
    textAlign: 'right',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  pillNeutral: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillNeutralText: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  passenger: {
    ...typography.subtitle,
    fontSize: 18,
    marginBottom: spacing.lg,
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
    minHeight: 34,
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
  routeLabel: {
    ...typography.label,
    color: colors.textSoft,
    marginBottom: 2,
  },
  routeAddress: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    color: colors.textSoft,
    fontSize: 13,
  },
  earningsValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  earningsDetail: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  rejectButton: {
    width: 62,
    height: 58,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    flex: 1,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  acceptText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  demoNote: {
    color: colors.textSoft,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.md,
    opacity: 0.8,
  },
});