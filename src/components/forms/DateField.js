import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import {
  parseDateOnly,
  toDisplayDate,
  toISODate,
  todayStart,
} from '../../utils/date';

// Campo de fecha con calendario nativo.
// Guarda siempre 'YYYY-MM-DD' y muestra 'DD/MM/AAAA'.
export default function DateField({
  label,
  value,
  onChange,
  error,
  helperText,
  minimumDate,
  maximumDate,
  placeholder = 'Selecciona una fecha',
  defaultDate,
}) {
  const [show, setShow] = useState(false);
  const selected = parseDateOnly(value);
  const [tempDate, setTempDate] = useState(selected ?? defaultDate ?? todayStart());

  const openPicker = () => {
    setTempDate(selected ?? defaultDate ?? todayStart());
    setShow(true);
  };

  const applyDate = (date) => {
    if (date) onChange(toISODate(date));
  };

  const handleChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'set' && date) applyDate(date);
      return;
    }
    if (date) setTempDate(date);
  };

  // Fallback para web (el picker nativo no existe allí).
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value ?? ''}
          onChangeText={onChange}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={colors.textSoft}
          maxLength={10}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: abrir calendario` : 'Abrir calendario'}
      >
        <Text style={[styles.valueText, !selected && styles.placeholder]}>
          {selected ? toDisplayDate(value) : placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={selected ? colors.text : colors.textSoft}
        />
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {show && Platform.OS === 'android' ? (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {show && Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setShow(false)} accessibilityRole="button">
                  <Text style={styles.cancel}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>{label || 'Selecciona una fecha'}</Text>
                <TouchableOpacity
                  onPress={() => {
                    applyDate(tempDate);
                    setShow(false);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.done}>Listo</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="dark"
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  valueText: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  placeholder: {
    color: colors.textSoft,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  cancel: {
    color: colors.textSoft,
    fontSize: 14,
  },
  done: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
