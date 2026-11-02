// Pantalla de Datos Personales del Conductor
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import InputField from '../../components/forms/InputField';
import { colors, spacing, radius, typography } from '../../theme';

export default function PersonalDataScreen() {
  const {
    personalData,
    updatePersonalData,
    personalErrors,
  } = useRegistration();

  // Estado para mostrar errores solo después de interactuar con el campo (touched)
  const [touched, setTouched] = useState({});

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Simulación de selección de foto (usando URLs/Avatares de prueba)
  const selectPhoto = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    ];
    // Asigna uno de prueba de forma aleatoria
    const randomAvatar = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
    updatePersonalData({ profilePhoto: randomAvatar });
    markTouched('profilePhoto');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Completa tus datos personales</Text>
      <Text style={styles.sectionSubtitle}>
        Todos los campos son obligatorios para poder activar tu cuenta
      </Text>


      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.avatarButton} onPress={selectPhoto}>
          {personalData.profilePhoto ? (
            <Image
              source={{ uri: personalData.profilePhoto }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera-outline" size={36} color={colors.textSoft} />
              <Text style={styles.avatarText}>Subir Foto</Text>
            </View>
          )}
        </TouchableOpacity>
        {touched.profilePhoto && personalErrors.profilePhoto && (
          <Text style={styles.photoError}>{personalErrors.profilePhoto}</Text>
        )}
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
      />


      <InputField
        label="Fecha de Nacimiento (AAAA-MM-DD)"
        placeholder="Ej. 1995-08-15"
        value={personalData.birthDate}
        onChangeText={(text) => {
          updatePersonalData({ birthDate: text });
          markTouched('birthDate');
        }}
        error={touched.birthDate ? personalErrors.birthDate : null}
        helperText="Debes ser mayor de 18 años"
        maxLength={10}
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
    paddingBottom: 40,
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
});