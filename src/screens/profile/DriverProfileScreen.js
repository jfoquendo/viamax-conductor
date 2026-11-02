import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { clearAllData } from '../../services/storage';
 
export default function DriverProfileScreen({ navigation }) {
  const handleLogout = async () => {
    await clearAllData();
    // Reinicia la app o recarga la sesión
  };
 
  return (
<View style={styles.container}>
<Text style={styles.title}>Mi Perfil</Text>
<Text style={styles.subtitle}>Información del conductor, vehículo y documentos</Text>
 
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
<Text style={styles.logoutText}>Cerrar Sesión / Reiniciar Registro</Text>
</TouchableOpacity>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.md,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '700',
  },
});