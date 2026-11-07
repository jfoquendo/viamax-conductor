// Pantalla de Documentos, Pagos y Envío de Registro del Conductor
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/forms/InputField';
import DateField from '../../components/forms/DateField';
import StepFooter from '../../components/forms/StepFooter';
import FormScreen from '../../components/layout/FormScreen';
import { colors, radius, spacing, typography } from '../../theme';
import { addDays, addYears, todayStart } from '../../utils/date';

export default function DocumentsScreen({ navigation }) {
  const {
    documentsData,
    updateDocumentsData,
    documentsErrors,
    personalData,
    vehicleData,
    isPersonalValid,
    isVehicleValid,
    isDocumentsValid,
    canSubmitRegistration,
    resetRegistration,
  } = useRegistration();
  const { submitRegistration } = useAuth();

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Simulación de subida de fotos de documentos
  const selectDocumentPhoto = (field) => {
    const sampleDocs = [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
    ];
    const randomDoc = sampleDocs[Math.floor(Math.random() * sampleDocs.length)];
    updateDocumentsData({ [field]: randomDoc });
    markTouched(field);
  };

  // La técnico-mecánica aplica desde los 5 años de antigüedad.
  const currentYear = new Date().getFullYear();
  const parsedYear = parseInt(vehicleData.year, 10);
  const requiresTechReview =
    Number.isFinite(parsedYear) && currentYear - parsedYear >= 5;

  const tomorrow = addDays(todayStart(), 1);

  const handleSubmit = async () => {
    if (!canSubmitRegistration || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // La contraseña viaja aparte: nunca se guarda en el perfil ni en Firestore.
      const { password, confirmPassword, ...personal } = personalData;
      await submitRegistration(
        { personal, vehicle: vehicleData, documents: documentsData },
        password
      );
      resetRegistration();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormScreen
      footer={
        <StepFooter
          step={3}
          onBack={() => navigation.navigate('VehicleData')}
          onNext={handleSubmit}
          nextLabel={isSubmitting ? 'Enviando…' : 'Enviar registro'}
          disabled={!canSubmitRegistration || isSubmitting}
          hint="Completa las 3 pestañas para enviar el registro"
        />
      }
    >
      <Text style={styles.sectionTitle}>Documentación y Cuenta de Pago</Text>
      <Text style={styles.sectionSubtitle}>
        Sube tus documentos legales vigentes y tu cuenta para recibir ganancias
      </Text>

      {submitError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={styles.errorBannerText}>{submitError}</Text>
        </View>
      ) : null}

      <View style={styles.docCard}>
        <Text style={styles.cardHeaderTitle}>Licencia de Conducción</Text>
        <InputField
          label="Número de Licencia"
          placeholder="Ej. 10203040"
          value={documentsData.driverLicenseNumber}
          onChangeText={(text) => {
            updateDocumentsData({ driverLicenseNumber: text.replace(/[^0-9A-Za-z-]/g, '') });
            markTouched('driverLicenseNumber');
          }}
          error={touched.driverLicenseNumber ? documentsErrors.driverLicenseNumber : null}
          autoCapitalize="characters"
          maxLength={20}
          returnKeyType="next"
        />

        <DateField
          label="Fecha de Vencimiento"
          value={documentsData.driverLicenseExpiry}
          onChange={(date) => {
            updateDocumentsData({ driverLicenseExpiry: date });
            markTouched('driverLicenseExpiry');
          }}
          error={touched.driverLicenseExpiry ? documentsErrors.driverLicenseExpiry : null}
          helperText="Debe ser posterior a la fecha actual"
          minimumDate={tomorrow}
          defaultDate={addYears(todayStart(), 2)}
          placeholder="Selecciona el vencimiento"
        />

        <TouchableOpacity
          style={styles.uploadDocButton}
          onPress={() => selectDocumentPhoto('driverLicensePhoto')}
          accessibilityRole="button"
        >
          {documentsData.driverLicensePhoto ? (
            <View style={styles.uploadedRow}>
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              <Text style={styles.uploadedText}>Foto de Licencia Cargada</Text>
            </View>
          ) : (
            <View style={styles.uploadRow}>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.textSoft} />
              <Text style={styles.uploadButtonText}>Subir Foto de Licencia</Text>
            </View>
          )}
        </TouchableOpacity>
        {touched.driverLicensePhoto && documentsErrors.driverLicensePhoto ? (
          <Text style={styles.errorText}>{documentsErrors.driverLicensePhoto}</Text>
        ) : null}
      </View>

      <View style={styles.docCard}>
        <Text style={styles.cardHeaderTitle}>SOAT</Text>
        <DateField
          label="Fecha de Vencimiento SOAT"
          value={documentsData.soatExpiry}
          onChange={(date) => {
            updateDocumentsData({ soatExpiry: date });
            markTouched('soatExpiry');
          }}
          error={touched.soatExpiry ? documentsErrors.soatExpiry : null}
          helperText="Debe ser posterior a la fecha actual"
          minimumDate={tomorrow}
          defaultDate={addYears(todayStart(), 1)}
          placeholder="Selecciona el vencimiento"
        />

        <TouchableOpacity
          style={styles.uploadDocButton}
          onPress={() => selectDocumentPhoto('soatPhoto')}
          accessibilityRole="button"
        >
          {documentsData.soatPhoto ? (
            <View style={styles.uploadedRow}>
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              <Text style={styles.uploadedText}>Foto de SOAT Cargada</Text>
            </View>
          ) : (
            <View style={styles.uploadRow}>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.textSoft} />
              <Text style={styles.uploadButtonText}>Subir Foto de SOAT</Text>
            </View>
          )}
        </TouchableOpacity>
        {touched.soatPhoto && documentsErrors.soatPhoto ? (
          <Text style={styles.errorText}>{documentsErrors.soatPhoto}</Text>
        ) : null}
      </View>

      {requiresTechReview ? (
        <View style={styles.docCard}>
          <Text style={styles.cardHeaderTitle}>Revisión Técnico-Mecánica</Text>
          <Text style={styles.cardHeaderSubtitle}>
            Requerida por antigüedad del vehículo (año {vehicleData.year})
          </Text>

          <DateField
            label="Fecha de Vencimiento RTM"
            value={documentsData.techReviewExpiry}
            onChange={(date) => {
              updateDocumentsData({ techReviewExpiry: date });
              markTouched('techReviewExpiry');
            }}
            error={touched.techReviewExpiry ? documentsErrors.techReviewExpiry : null}
            minimumDate={tomorrow}
            defaultDate={addYears(todayStart(), 1)}
            placeholder="Selecciona el vencimiento"
          />

          <TouchableOpacity
            style={styles.uploadDocButton}
            onPress={() => selectDocumentPhoto('techReviewPhoto')}
            accessibilityRole="button"
          >
            {documentsData.techReviewPhoto ? (
              <View style={styles.uploadedRow}>
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                <Text style={styles.uploadedText}>Foto de RTM Cargada</Text>
              </View>
            ) : (
              <View style={styles.uploadRow}>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.textSoft} />
                <Text style={styles.uploadButtonText}>Subir Foto de RTM</Text>
              </View>
            )}
          </TouchableOpacity>
          {touched.techReviewPhoto && documentsErrors.techReviewPhoto ? (
            <Text style={styles.errorText}>{documentsErrors.techReviewPhoto}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.docCard}>
        <Text style={styles.cardHeaderTitle}>Recepción de Ganancias</Text>
        <InputField
          label="Correo de cuenta Mercado Pago"
          placeholder="tu-correo@mercadopago.com"
          value={documentsData.mercadoPagoEmail}
          onChangeText={(text) => {
            updateDocumentsData({ mercadoPagoEmail: text });
            markTouched('mercadoPagoEmail');
          }}
          error={touched.mercadoPagoEmail ? documentsErrors.mercadoPagoEmail : null}
          keyboardType="email-address"
          helperText="Aquí se transferirán los cobros realizados por la pasarela"
          returnKeyType="done"
        />
      </View>

      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => {
          updateDocumentsData({ acceptedTerms: !documentsData.acceptedTerms });
          markTouched('acceptedTerms');
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: documentsData.acceptedTerms }}
      >
        <Ionicons
          name={documentsData.acceptedTerms ? 'checkbox' : 'square-outline'}
          size={24}
          color={documentsData.acceptedTerms ? colors.primary : colors.textSoft}
        />
        <Text style={styles.termsText}>
          Acepto los términos y condiciones de ViaMax, reconociendo la tasa de comisión de la
          plataforma del <Text style={styles.termsHighlight}>20%</Text> sobre cada viaje
          finalizado.
        </Text>
      </TouchableOpacity>
      {touched.acceptedTerms && documentsErrors.acceptedTerms ? (
        <Text style={[styles.errorText, { marginBottom: spacing.md }]}>
          {documentsErrors.acceptedTerms}
        </Text>
      ) : null}

      <View style={styles.validationSummary}>
        <View style={styles.summaryItem}>
          <Ionicons
            name={isPersonalValid ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={isPersonalValid ? colors.primary : colors.textSoft}
          />
          <Text style={styles.summaryText}>1. Datos Personales</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons
            name={isVehicleValid ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={isVehicleValid ? colors.primary : colors.textSoft}
          />
          <Text style={styles.summaryText}>2. Datos del Vehículo</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons
            name={isDocumentsValid ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={isDocumentsValid ? colors.primary : colors.textSoft}
          />
          <Text style={styles.summaryText}>3. Documentos y Pagos</Text>
        </View>
      </View>

      {isSubmitting ? (
        <View style={styles.submittingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.submittingText}>Guardando tu registro…</Text>
        </View>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.title,
    fontSize: 22,
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSoft,
    fontSize: 14,
    marginBottom: spacing.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: 13,
    flex: 1,
    fontWeight: '600',
  },
  docCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  cardHeaderTitle: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardHeaderSubtitle: {
    color: colors.textSoft,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  uploadDocButton: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadButtonText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadedText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  termsText: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  termsHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  validationSummary: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  submittingText: {
    color: colors.textSoft,
    fontSize: 13,
  },
});
