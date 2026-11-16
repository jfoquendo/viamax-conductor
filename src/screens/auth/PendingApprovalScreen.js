// Pantalla de espera mientras el equipo aprueba la cuenta del conductor.
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing, typography } from '../../theme';

const STATUS_COPY = {
  pending_approval: {
    icon: 'time',
    colorKey: 'warning',
    title: 'Registro en revisión',
    message:
      'Tu documentación fue recibida. El equipo de ViaMax verificará tus datos antes de activar tu cuenta.',
  },
  rejected: {
    icon: 'close-circle',
    colorKey: 'danger',
    title: 'Registro rechazado',
    message:
      'No pudimos aprobar tu cuenta con la información enviada. Revisa tus documentos y vuelve a registrarte.',
  },
  suspended: {
    icon: 'pause-circle',
    colorKey: 'danger',
    title: 'Cuenta suspendida',
    message: 'Tu cuenta está suspendida temporalmente. Contacta al equipo de soporte de ViaMax.',
  },
};

export default function PendingApprovalScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    accountStatus,
    user,
    isDemo,
    refreshProfile,
    simulateApproval,
    logout,
  } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionError, setActionError] = useState(null);

  const copy = STATUS_COPY[accountStatus] ?? STATUS_COPY.pending_approval;
  const accent = colors[copy.colorKey];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setActionError(null);
    try {
      await refreshProfile();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSimulate = async () => {
    setActionError(null);
    try {
      await simulateApproval();
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${accent}22` }]}>
        <Ionicons name={copy.icon} size={64} color={accent} />
      </View>

      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.message}>{copy.message}</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Cuenta</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Estado</Text>
          <Text style={[styles.value, { color: accent }]}>
            {accountStatus === 'pending_approval' ? 'Pendiente de aprobación' : accountStatus}
          </Text>
        </View>
        {profile?.personal?.fullName ? (
          <>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Conductor</Text>
              <Text style={styles.value}>{profile.personal.fullName}</Text>
            </View>
          </>
        ) : null}
      </View>

      {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={isRefreshing}
        accessibilityRole="button"
      >
        {isRefreshing ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <>
            <Ionicons name="refresh" size={18} color={colors.textInverse} />
            <Text style={styles.refreshText}>Actualizar estado</Text>
          </>
        )}
      </TouchableOpacity>

      {__DEV__ && isDemo ? (
        <TouchableOpacity style={styles.devButton} onPress={handleSimulate} accessibilityRole="button">
          <Ionicons name="construct-outline" size={16} color={colors.warning} />
          <Text style={styles.devText}>
            Simular aprobación ({isDemo ? 'demo local' : 'requiere ALLOW_DEV_APPROVAL'})
          </Text>
        </TouchableOpacity>
      ) : null}

      {!isDemo ? (
        <Text style={styles.consoleHint}>
          La aprobación se gestiona en Firestore Console: drivers → tu documento → status =
          "approved".
        </Text>
      ) : null}

      <TouchableOpacity style={styles.logoutButton} onPress={logout} accessibilityRole="button">
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.textSoft,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  refreshButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  refreshText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  devText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  logoutText: {
    color: colors.textSoft,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  consoleHint: {
    color: colors.textSoft,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    opacity: 0.85,
  },
});
