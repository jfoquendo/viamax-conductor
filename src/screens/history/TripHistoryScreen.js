import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
 
export default function TripHistoryScreen() {
  return (
<View style={styles.container}>
<Text style={styles.title}>Historial de Viajes</Text>
<Text style={styles.subtitle}>Registro de carreras anteriores y calificaciones</Text>
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