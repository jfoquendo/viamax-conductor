import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
 
export default function VehicleDataScreen() {
  return (
<View style={styles.container}>
<Text style={styles.title}>Vehículo</Text>
<Text style={styles.subtitle}>Detalles técnicos y categoría de tu vehículo</Text>
</View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
  },
});