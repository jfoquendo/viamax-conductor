// Historial de viajes del conductor, con filtro por periodo y detalle.
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import useTripHistory, { HISTORY_FILTERS } from '../../hooks/useTripHistory';
import TripMapCard from '../../components/maps/TripMapCard';
import { PAYMENT_METHOD_LABELS, TRIP_STATUS, TRIP_STATUS_LABELS } from '../../config/trips';
import { colors, radius, spacing, typography, shadows } from '../../theme';

const formatCOP = (value) =>
  '$' + Math.round(Number(value) || 0).toLocaleString('es-CO') + ' COP';

const formatDate = (value) => {
  if (!value) return '';
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()} · ${hours}:${minutes}`;
};

function FilterBar({ filter, onChange }) {
  return (
    <View style={styles.filterRow}>
      {Object.entries(HISTORY_FILTERS).map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={[styles.filterChip, filter === key && styles.filterChipActive]}
          onPress={() => onChange(key)}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === key }}
        >
          <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function TripRow({ trip, expanded, onToggle }) {
  const statusLabel = TRIP_STATUS_LABELS[trip.status] ?? trip.status;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8} accessibilityRole="button">
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {trip.destination?.address ?? 'Viaje'}
            </Text>
            <Text style={styles.cardDate}>
              {formatDate(trip.completedAt ?? trip.requestedAt)}
            </Text>
          </View>
          <Text style={styles.cardAmount}>{formatCOP(trip.driverEarnings)}</Text>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="speedometer-outline" size={13} color={colors.textSoft} />
            <Text style={styles.metaText}>{trip.distanceKm ?? '—'} km</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={13} color={colors.textSoft} />
            <Text style={styles.metaText}>
              {PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? 'Efectivo'}
            </Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>{statusLabel}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSoft}
            style={styles.metaChevron}
          />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Recogida</Text>
          <Text style={styles.detailValue}>{trip.origin?.address ?? '—'}</Text>

          <Text style={[styles.detailLabel, { marginTop: spacing.sm }]}>Destino</Text>
          <Text style={styles.detailValue}>{trip.destination?.address ?? '—'}</Text>

          {trip.origin?.latitude && trip.destination?.latitude ? (
            <View style={styles.mapWrapper}>
              <TripMapCard
                origin={{
                  latitude: trip.origin.latitude,
                  longitude: trip.origin.longitude,
                }}
                destination={{
                  latitude: trip.destination.latitude,
                  longitude: trip.destination.longitude,
                }}
                height={180}
              />
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tarifa</Text>
            <Text style={styles.detailValue}>{formatCOP(trip.fare)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Comisión</Text>
            <Text style={styles.detailValue}>- {formatCOP(trip.commission)}</Text>
          </View>
          {Number(trip.tip) > 0 ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Propina</Text>
              <Text style={styles.detailValue}>{formatCOP(trip.tip)}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, styles.detailTotal]}>Ganancia</Text>
            <Text style={styles.detailTotalValue}>{formatCOP(trip.driverEarnings)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function TripHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { trips, totals, filter, setFilter, isLoading, error } = useTripHistory(user?.uid);
  const [expandedId, setExpandedId] = useState(null);

  const header = useMemo(
    () => (
      <View>
        <FilterBar filter={filter} onChange={setFilter} />
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.count}</Text>
            <Text style={styles.summaryLabel}>Viajes</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totals.distance.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Km</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {formatCOP(totals.amount)}
            </Text>
            <Text style={styles.summaryLabel}>Ganado</Text>
          </View>
        </View>
      </View>
    ),
    [filter, totals]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
        trips.length === 0 && styles.contentEmpty,
      ]}
      data={trips}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <TripRow
          trip={item}
          expanded={expandedId === item.id}
          onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={44} color={colors.textSoft} />
          <Text style={styles.emptyTitle}>
            {error ? 'No se pudo cargar el historial' : 'Aún no hay viajes'}
          </Text>
          <Text style={styles.emptyText}>
            {error ?? 'Los viajes que completes aparecerán aquí.'}
          </Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
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
  contentEmpty: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.primary,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryLabel: {
    ...typography.label,
    color: colors.textSoft,
    fontSize: 10,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cardDate: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 2,
  },
  cardAmount: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSoft,
    fontSize: 11,
  },
  metaBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  metaBadgeText: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: '700',
  },
  metaChevron: {
    marginLeft: 'auto',
  },
  detail: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    ...typography.label,
    color: colors.textSoft,
    fontSize: 10,
    marginBottom: 2,
  },
  detailValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  detailTotal: {
    color: colors.text,
    fontSize: 12,
  },
  detailTotalValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  mapWrapper: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
