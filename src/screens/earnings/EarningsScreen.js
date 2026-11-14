// Pantalla de ganancias del conductor: resumen por periodo y saldo.
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import useEarnings from '../../hooks/useEarnings';
import { colors, radius, spacing, typography, shadows } from '../../theme';

const formatCOP = (value) => {
  const rounded = Math.round(Number(value) || 0);
  const sign = rounded < 0 ? '-' : '';
  return sign + '$' + Math.abs(rounded).toLocaleString('es-CO') + ' COP';
};

function PeriodCard({ icon, label, amount, trips, highlight }) {
  return (
    <View style={[styles.periodCard, highlight && styles.periodCardHighlight]}>
      <View style={styles.periodHeader}>
        <Ionicons name={icon} size={16} color={highlight ? colors.primary : colors.textSoft} />
        <Text style={[styles.periodLabel, highlight && styles.periodLabelHighlight]}>{label}</Text>
      </View>
      <Text style={[styles.periodAmount, highlight && styles.periodAmountHighlight]}>
        {formatCOP(amount)}
      </Text>
      <Text style={styles.periodTrips}>
        {trips} {trips === 1 ? 'viaje' : 'viajes'}
      </Text>
    </View>
  );
}

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { trips, summary, isLoading, error } = useEarnings(user?.uid);

  const average = useMemo(() => {
    const month = summary?.month;
    if (!month || !month.trips) return 0;
    return month.amount / month.trips;
  }, [summary]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />}
    >
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo pendiente</Text>
        <Text style={styles.balanceAmount}>
          {formatCOP(summary?.pendingBalance ?? 0)}
        </Text>
        <Text style={styles.balanceHint}>
          Lo cobrado con tarjeta queda en la plataforma hasta la liquidación.
          El efectivo se descuenta solo por la comisión.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Resumen</Text>

      <View style={styles.periodRow}>
        <PeriodCard
          icon="sunny-outline"
          label="Hoy"
          amount={summary?.today?.amount ?? 0}
          trips={summary?.today?.trips ?? 0}
        />
        <PeriodCard
          icon="calendar-outline"
          label="Semana"
          amount={summary?.week?.amount ?? 0}
          trips={summary?.week?.trips ?? 0}
        />
      </View>

      <View style={styles.periodRow}>
        <PeriodCard
          icon="stats-chart-outline"
          label="Mes"
          amount={summary?.month?.amount ?? 0}
          trips={summary?.month?.trips ?? 0}
          highlight
        />
        <PeriodCard
          icon="analytics-outline"
          label="Promedio por viaje"
          amount={average}
          trips={summary?.month?.trips ?? 0}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {trips.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="cash-outline" size={40} color={colors.textSoft} />
          <Text style={styles.emptyTitle}>Aún no tienes ganancias</Text>
          <Text style={styles.emptyText}>
            Completa y cobra un viaje para ver el resumen aquí.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>Últimos viajes cobrados</Text>
          {trips.slice(0, 10).map((trip) => (
            <View key={trip.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {trip.destination?.address ?? 'Viaje'}
                </Text>
                <Text style={styles.rowSubtitle}>
                  {trip.distanceKm ?? '—'} km · {trip.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}
                </Text>
              </View>
              <Text style={styles.rowAmount}>{formatCOP(trip.driverEarnings)}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  balanceLabel: {
    ...typography.label,
    color: colors.textSoft,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '800',
  },
  balanceHint: {
    color: colors.textSoft,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSoft,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  periodRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  periodCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  periodCardHighlight: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  periodLabel: {
    ...typography.label,
    color: colors.textSoft,
    fontSize: 10,
  },
  periodLabelHighlight: {
    color: colors.primary,
  },
  periodAmount: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  periodAmountHighlight: {
    color: colors.primary,
  },
  periodTrips: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    flex: 1,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.subtitle,
    fontSize: 15,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.textSoft,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 24,
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  rowAmount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
