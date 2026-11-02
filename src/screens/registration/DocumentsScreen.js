import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
 
export default function DocumentsScreen() {
  return (
<View style={styles.container}>
<Text style={styles.title}>Documentos y Pagos</Text>
<Text style={styles.subtitle}>Licencia, SOAT y cuenta de Mercado Pago</Text>
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