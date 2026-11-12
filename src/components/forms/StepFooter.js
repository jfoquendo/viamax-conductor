import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';

// Pie de navegación del registro: paso actual + Anterior/Siguiente.
export default function StepFooter({
  step,
  total = 3,
  onBack,
  onNext,
  nextLabel = 'Siguiente',
  disabled = false,
  hint,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        <Text style={styles.stepText}>
          Paso {step} de {total}
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index + 1 <= step && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Volver al paso anterior"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !onBack && styles.nextButtonFull,
            disabled && styles.nextButtonDisabled,
          ]}
          onPress={onNext}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          accessibilityLabel={nextLabel}
        >
          <Text style={[styles.nextText, disabled && styles.nextTextDisabled]}>
            {nextLabel}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={disabled ? colors.textSoft : colors.textInverse}
          />
        </TouchableOpacity>
      </View>

      {disabled && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepText: {
    ...typography.label,
    color: colors.textSoft,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 52,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  nextText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  nextTextDisabled: {
    color: colors.textSoft,
  },
  hint: {
    color: colors.textSoft,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
