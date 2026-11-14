// Pantalla de Datos Personales del Conductor
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { selectImageSource } from '../../utils/imagePicker';
import InputField from '../../components/forms/InputField';
import DateField from '../../components/forms/DateField';
import StepFooter from '../../components/forms/StepFooter';
import FormScreen from '../../components/layout/FormScreen';
import { colors, radius, spacing, typography } from '../../theme';
import { addYears, todayStart } from '../../utils/date';

export default function PersonalDataScreen({ navigation }) {
  const { personalData, updatePersonalData, personalErrors, isPersonalValid } =
    useRegistration();

  const [touched, setTouched] = useState({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState(null);

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Simulación de selección de foto (usando URLs/Avatares de prueba)

  const selectPhoto = async () => {
    if (isUploadingPhoto) return;

    markTouched('profilePhoto');
    setPhotoUploadError(null);

    try {
      const imageUri = await selectImageSource();

      if (!imageUri) return;

      setIsUploadingPhoto(true);

      const uploaded = await uploadImageToCloudinary(
        imageUri,
        {
          folder: 'viamax/drivers/profile',
        }
      );

      updatePersonalData({
        profilePhoto: uploaded.url,
      });
    } catch (error) {
      setPhotoUploadError(
        error?.message ?? 'No se pudo subir la foto'
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleNext = () => {
    navigation.navigate('VehicleData');
  };

  return (
    <FormScreen
      footer={
        <StepFooter
          step={1}
          onNext={handleNext}
          disabled={!isPersonalValid}
          hint="Completa todos los campos para continuar"
        />
      }
    >
      <Text style={styles.sectionTitle}>Completa tus datos personales</Text>
      <Text style={styles.sectionSubtitle}>
        Todos los campos son obligatorios para poder activar tu cuenta
      </Text>

      <View style={styles.photoSection}>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={selectPhoto}
          disabled={isUploadingPhoto}
          accessibilityRole="button"
          accessibilityLabel="Seleccionar foto de perfil"
        >
          {personalData.profilePhoto ? (
            <Image source={{ uri: personalData.profilePhoto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={colors.textSoft} />
              <Text style={styles.avatarText}>Subir Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {isUploadingPhoto ? (
          <Text style={styles.photoStatus}>
            Subiendo foto…
          </Text>
        ) : null}

        {photoUploadError ? (
          <Text style={styles.photoError}>
            {photoUploadError}
          </Text>
        ) : null}
        {touched.profilePhoto && personalErrors.profilePhoto ? (
          <Text style={styles.photoError}>{personalErrors.profilePhoto}</Text>
        ) : null}
      </View>

      <InputField
        label="Nombre Completo"
        placeholder="Ej. Carlos Alberto Pérez"
        value={personalData.fullName}
        onChangeText={(text) => {
          updatePersonalData({ fullName: text });
          markTouched('fullName');
        }}
        error={touched.fullName ? personalErrors.fullName : null}
        maxLength={50}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />

      <InputField
        label="Documento de Identidad (C.C.)"
        placeholder="Ej. 1020304050"
        value={personalData.idNumber}
        onChangeText={(text) => {
          updatePersonalData({ idNumber: text });
          markTouched('idNumber');
        }}
        error={touched.idNumber ? personalErrors.idNumber : null}
        keyboardType="numeric"
        maxLength={10}
        returnKeyType="next"
      />

      <InputField
        label="Número de Celular"
        placeholder="Ej. 3001234567"
        value={personalData.phoneNumber}
        onChangeText={(text) => {
          updatePersonalData({ phoneNumber: text });
          markTouched('phoneNumber');
        }}
        error={touched.phoneNumber ? personalErrors.phoneNumber : null}
        keyboardType="phone-pad"
        maxLength={10}
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="next"
      />

      <DateField
        label="Fecha de Nacimiento"
        value={personalData.birthDate}
        onChange={(date) => {
          updatePersonalData({ birthDate: date });
          markTouched('birthDate');
        }}
        error={touched.birthDate ? personalErrors.birthDate : null}
        helperText="Debes ser mayor de 18 años"
        maximumDate={addYears(todayStart(), -18)}
        defaultDate={addYears(todayStart(), -25)}
        placeholder="Selecciona tu fecha de nacimiento"
      />

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Género</Text>
        <View style={styles.genderOptions}>
          {[
            { label: 'Masculino', value: 'M' },
            { label: 'Femenino', value: 'F' },
            { label: 'Otro', value: 'Otro' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderButton,
                personalData.gender === option.value && styles.genderButtonActive,
              ]}
              onPress={() => updatePersonalData({ gender: option.value })}
              accessibilityRole="radio"
              accessibilityState={{ selected: personalData.gender === option.value }}
            >
              <Text
                style={[
                  styles.genderText,
                  personalData.gender === option.value && styles.genderTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <InputField
        label="Correo Electrónico"
        placeholder="conductor@viamax.com"
        value={personalData.email}
        onChangeText={(text) => {
          updatePersonalData({ email: text });
          markTouched('email');
        }}
        error={touched.email ? personalErrors.email : null}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />

      <InputField
        label="Contraseña"
        placeholder="Mínimo 8 caracteres, con letra y número"
        value={personalData.password}
        onChangeText={(text) => {
          updatePersonalData({ password: text });
          markTouched('password');
        }}
        error={touched.password ? personalErrors.password : null}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
        returnKeyType="next"
      />

      <InputField
        label="Confirmar Contraseña"
        placeholder="Repite la contraseña"
        value={personalData.confirmPassword}
        onChangeText={(text) => {
          updatePersonalData({ confirmPassword: text });
          markTouched('confirmPassword');
        }}
        error={touched.confirmPassword ? personalErrors.confirmPassword : null}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
        returnKeyType="done"
      />

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Idioma de la Aplicación</Text>
        <View style={styles.genderOptions}>
          {[
            { label: 'Español', value: 'es' },
            { label: 'Inglés', value: 'en' },
          ].map((lang) => (
            <TouchableOpacity
              key={lang.value}
              style={[
                styles.genderButton,
                personalData.language === lang.value && styles.genderButtonActive,
              ]}
              onPress={() => updatePersonalData({ language: lang.value })}
              accessibilityRole="radio"
              accessibilityState={{ selected: personalData.language === lang.value }}
            >
              <Text
                style={[
                  styles.genderText,
                  personalData.language === lang.value && styles.genderTextActive,
                ]}
              >
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.textSoft,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  photoError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  genderButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  genderText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  genderTextActive: {
    color: colors.primary,
  },
  photoStatus: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
});
