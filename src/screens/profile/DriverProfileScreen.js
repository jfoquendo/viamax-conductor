// Perfil del conductor con datos reales de la cuenta.
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { CATEGORY_LABELS } from '../../config/pricing';
import { colors, radius, spacing, typography } from '../../theme';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.textSoft} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function DriverProfileScreen() {
  const { profile, user, accountStatus, logout } = useAuth();

  const personal = profile?.personal ?? {};
  const vehicle = profile?.vehicle ?? {};
  const documents = profile?.documents ?? {};

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => logout().catch(() => {}),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={colors.primary} />
        </View>
        <Text style={styles.name}>{personal.fullName || 'Conductor ViaMax'}</Text>
        <Text style={styles.email}>{user?.email || personal.email || ''}</Text>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>
            {accountStatus === 'approved' ? 'Cuenta aprobada' : 'En revisión'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Datos personales</Text>
      <View style={styles.card}>
        <InfoRow icon="call-outline" label="Celular" value={personal.phoneNumber} />
        <InfoRow icon="card-outline" label="Documento" value={personal.idNumber} />
        <InfoRow icon="calendar-outline" label="Fecha de nacimiento" value={personal.birthDate} />
        <InfoRow icon="mail-outline" label="Correo de pago" value={documents.mercadoPagoEmail} />
      </View>

      <Text style={styles.sectionLabel}>Vehículo</Text>
      <View style={styles.card}>
        <InfoRow
          icon="car-outline"
          label="Vehículo"
          value={[vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
        />
        <InfoRow icon="pricetag-outline" label="Placa" value={vehicle.licensePlate} />
        <InfoRow
          icon="star-outline"
          label="Categoría"
          value={CATEGORY_LABELS[vehicle.category] ?? vehicle.category}
        />
        <InfoRow icon="people-outline" label="Capacidad" value={vehicle.passengerCapacity} />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={confirmLogout}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ViaMax Conductor · v1.0.0</Text>
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
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    fontSize: 20,
    color: colors.text,
  },
  email: {
    color: colors.textSoft,
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionLabel: {
    ...typography.label,
    color: colors.textSoft,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowIcon: {
    width: 28,
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  version: {
    textAlign: 'center',
    color: colors.textSoft,
    fontSize: 11,
    marginTop: spacing.lg,
    opacity: 0.7,
  },
});
