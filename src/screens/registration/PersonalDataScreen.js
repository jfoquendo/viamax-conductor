import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
 
export default function PersonalDataScreen() {
  return (
<View style={styles.container}>
<Text style={styles.title}>Datos Personales</Text>
<Text style={styles.subtitle}>Información básica requerida para el registro</Text>
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