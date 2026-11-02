// Pantalla de Documentos, Pagos y Envío de Registro del Conductor
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import InputField from '../../components/forms/InputField';
import { colors, spacing, radius, typography } from '../../theme';
import { saveData, STORAGE_KEYS } from '../../services/storage';

export default function DocumentsScreen() {
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
  } = useRegistration();

  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

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

  // Determinar si aplica técnico-mecánica según el año del vehículo (5+ años de antigüedad)
  const currentYear = new Date().getFullYear();
  const vehicleYearNum = parseInt(vehicleData.year, 10) || currentYear;
  const requiresTechReview = (currentYear - vehicleYearNum) >= 5;

  // Manejador del botón Enviar Registro
  const handleSubmit = async () => {
    if (!canSubmitRegistration) return;

    setIsSubmitting(true);
    try {
      const fullDriverProfile = {
        personal: personalData,
        vehicle: vehicleData,
        documents: documentsData,
        status: 'pending_approval', // Estado inicial según requerimientos
        registeredAt: new Date().toISOString(),
      };

      // Guardar en el almacenamiento local persistente
      await saveData(STORAGE_KEYS.driverProfile, fullDriverProfile);
      setSubmissionSuccess(true);
    } catch (error) {
      console.error('Error guardando registro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si ya se envió con éxito, mostramos la pantalla de "Pendiente de Aprobación"
  if (submissionSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBadge}>
          <Ionicons name="time" size={60} color={colors.warning} />
        </View>
        <Text style={styles.successTitle}>Registro en Revisión</Text>
        <Text style={styles.successText}>
          Tu cuenta ha quedado en estado <Text style={styles.statusHighlight}>Pendiente de aprobación</Text>.
        </Text>
        <Text style={styles.successSubtext}>
          Estamos validando tus antecedentes, documentos y datos del vehículo. No podrás ponerte en modo 'Disponible' hasta que tu cuenta sea aprobada por el equipo de ViaMax.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Documentación y Cuenta de Pago</Text>
      <Text style={styles.sectionSubtitle}>
        Sube tus documentos legales vigentes y tu cuenta para recibir ganancias
      </Text>

    
      <View style={styles.docCard}>
        <Text style={styles.cardHeaderTitle}>Licencia de Conducción</Text>
        <InputField
          label="Número de Licencia"
          placeholder="Ej. 10203040"
          value={documentsData.driverLicenseNumber}
          onChangeText={(text) => {
            updateDocumentsData({ driverLicenseNumber: text });
            markTouched('driverLicenseNumber');
          }}
          error={touched.driverLicenseNumber ? documentsErrors.driverLicenseNumber : null}
          keyboardType="numeric"
        />

        <InputField
          label="Fecha de Vencimiento (AAAA-MM-DD)"
          placeholder="Ej. 2028-12-31"
          value={documentsData.driverLicenseExpiry}
          onChangeText={(text) => {
            updateDocumentsData({ driverLicenseExpiry: text });
            markTouched('driverLicenseExpiry');
          }}
          error={touched.driverLicenseExpiry ? documentsErrors.driverLicenseExpiry : null}
          helperText="Debe ser posterior a la fecha actual"
          maxLength={10}
        />

        <TouchableOpacity
          style={styles.uploadDocButton}
          onPress={() => selectDocumentPhoto('driverLicensePhoto')}
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
        {touched.driverLicensePhoto && documentsErrors.driverLicensePhoto && (
          <Text style={styles.errorText}>{documentsErrors.driverLicensePhoto}</Text>
        )}
      </View>


      <View style={styles.docCard}>
        <Text style={styles.cardHeaderTitle}>SOAT</Text>
        <InputField
          label="Fecha de Vencimiento SOAT (AAAA-MM-DD)"
          placeholder="Ej. 2027-06-15"
          value={documentsData.soatExpiry}
          onChangeText={(text) => {
            updateDocumentsData({ soatExpiry: text });
            markTouched('soatExpiry');
          }}
          error={touched.soatExpiry ? documentsErrors.soatExpiry : null}
          helperText="Debe ser posterior a la fecha actual"
          maxLength={10}
        />

        <TouchableOpacity
          style={styles.uploadDocButton}
          onPress={() => selectDocumentPhoto('soatPhoto')}
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
        {touched.soatPhoto && documentsErrors.soatPhoto && (
          <Text style={styles.errorText}>{documentsErrors.soatPhoto}</Text>
        )}
      </View>


      {requiresTechReview && (
        <View style={styles.docCard}>
          <Text style={styles.cardHeaderTitle}>Revisión Técnico-Mecánica</Text>
          <Text style={styles.cardHeaderSubtitle}>
            Requerida por antigüedad del vehículo (año {vehicleData.year})
          </Text>

          <InputField
            label="Fecha de Vencimiento RTM (AAAA-MM-DD)"
            placeholder="Ej. 2027-11-20"
            value={documentsData.techReviewExpiry}
            onChangeText={(text) => {
              updateDocumentsData({ techReviewExpiry: text });
              markTouched('techReviewExpiry');
            }}
            error={touched.techReviewExpiry ? documentsErrors.techReviewExpiry : null}
            maxLength={10}
          />

          <TouchableOpacity
            style={styles.uploadDocButton}
            onPress={() => selectDocumentPhoto('techReviewPhoto')}
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
          {touched.techReviewPhoto && documentsErrors.techReviewPhoto && (
            <Text style={styles.errorText}>{documentsErrors.techReviewPhoto}</Text>
          )}
        </View>
      )}


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
        />
      </View>


      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => {
          updateDocumentsData({ acceptedTerms: !documentsData.acceptedTerms });
          markTouched('acceptedTerms');
        }}
      >
        <Ionicons
          name={documentsData.acceptedTerms ? 'checkbox' : 'square-outline'}
          size={24}
          color={documentsData.acceptedTerms ? colors.primary : colors.textSoft}
        />
        <Text style={styles.termsText}>
          Acepto los términos y condiciones de ViaMax, reconociendo la tasa de comisión de la plataforma del <Text style={styles.termsHighlight}>20%</Text> sobre cada viaje finalizado.
        </Text>
      </TouchableOpacity>
      {touched.acceptedTerms && documentsErrors.acceptedTerms && (
        <Text style={[styles.errorText, { marginBottom: spacing.md }]}>{documentsErrors.acceptedTerms}</Text>
      )}

      {/* Resumen de estado de validación */}
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


      <TouchableOpacity
        style={[
          styles.submitButton,
          !canSubmitRegistration && styles.submitButtonDisabled,
        ]}
        disabled={!canSubmitRegistration || isSubmitting}
        onPress={handleSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text
            style={[
              styles.submitButtonText,
              !canSubmitRegistration && styles.submitButtonTextDisabled,
            ]}
          >
            {canSubmitRegistration ? 'Enviar Registro' : 'Completa las 3 pestañas'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
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
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  submitButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
  submitButtonTextDisabled: {
    color: colors.textSoft,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.warningSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    fontSize: 16,
    marginBottom: spacing.md,
  },
  statusHighlight: {
    color: colors.warning,
    fontWeight: 'bold',
  },
  successSubtext: {
    ...typography.body,
    color: colors.textSoft,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
});