import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { PAYMENT_METHOD_LABELS, TRIP_STATUS } from '../../config/trips';
import { colors, radius, spacing, typography, shadows } from '../../theme';

const formatCOP = (value) =>
  '$' + Math.round(Number(value) || 0).toLocaleString('es-CO') + ' COP';

export default function TripSummaryScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { tripId, fare: fareFromRoute } = route?.params ?? {};

  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(!fareFromRoute);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState(null);

  const category = profile?.vehicle?.category ?? 'economy';

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (fareFromRoute) return;
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
  }, [tripId, fareFromRoute]);

  const fare = useMemo(() => {
    if (fareFromRoute) return fareFromRoute;
    if (!trip) return null;
    return calculateFare({
      distanceKm: trip.distanceKm,
      durationMin: trip.durationMin,
      category: trip.category ?? category,
      tip: trip.tip ?? 0,
    });
  }, [fareFromRoute, trip, category]);

  const close = async () => {
    setIsWorking(true);
    try {
      if (trip || tripId) {
        await tripSource.advance(tripId, TRIP_STATUS.PAID);
      }
    } catch (payError) {
      setError(payError?.message ?? 'No se pudo registrar el pago');
    } finally {
      setIsWorking(false);
      navigation?.reset?.({ index: 0, routes: [{ name: 'MainDrawer' }] });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconBadge}>
          <Ionicons name="checkmark" size={44} color={colors.textInverse} />
        </View>

        <Text style={styles.title}>Viaje finalizado</Text>
        <Text style={styles.subtitle}>
          {trip?.destination?.address ?? 'Destino alcanzado'}
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Tarifa</Text>
            <Text style={styles.value}>{fare ? formatCOP(fare.fare) : '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Comisión plataforma ({fare ? Math.round(fare.commissionRate * 100) : 20}%)</Text>
            <Text style={[styles.value, { color: colors.textSoft }]}>
              − {fare ? formatCOP(fare.commission) : '—'}
            </Text>
          </View>
          {fare && fare.tip > 0 ? (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Propina</Text>
                <Text style={styles.value}>{formatCOP(fare.tip)}</Text>
              </View>
            </>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={[styles.label, styles.totalLabel]}>Tu ganancia</Text>
            <Text style={styles.total}>{fare ? formatCOP(fare.driverEarnings) : '—'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Método de pago</Text>
            <Text style={styles.value}>
              {PAYMENT_METHOD_LABELS[trip?.paymentMethod] ?? 'Efectivo'}
            </Text>
          </View>
          {fare ? (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Total cobrado al pasajero</Text>
                <Text style={styles.value}>{formatCOP(fare.total)}</Text>
              </View>
            </>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={close}
          disabled={isWorking}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
        >
          {isWorking ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Volver al inicio</Text>
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
  },
  content: {
    paddingBottom: spacing.lg,
  },
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    color: colors.textSoft,
    fontSize: 13,
    flex: 1,
  },
  totalLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  total: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    paddingTop: spacing.md,
  },
  button: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
});