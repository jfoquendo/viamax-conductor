import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
 
export default function EarningsScreen() {
  return (
<View style={styles.container}>
<Text style={styles.title}>Mis Ganancias</Text>
<Text style={styles.subtitle}>Resumen del día, semana y mes</Text>
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
  },
});