// Pantalla de Datos del Vehículo del Conductor
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../../context/RegistrationContext';
import InputField from '../../components/forms/InputField';
import StepFooter from '../../components/forms/StepFooter';
import FormScreen from '../../components/layout/FormScreen';
import { colors, radius, spacing, typography } from '../../theme';
import { CATEGORY_LABELS, VEHICLE_CATEGORIES } from '../../config/pricing';

export default function VehicleDataScreen({ navigation }) {
  const { vehicleData, updateVehicleData, vehicleErrors, isVehicleValid } =
    useRegistration();

  const [touched, setTouched] = useState({});
  const commonColors = ['Negro', 'Blanco', 'Gris', 'Plata', 'Rojo', 'Azul'];
  const [isCustomColor, setIsCustomColor] = useState(
    !commonColors.includes(vehicleData.color)
  );

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Simulación de foto de vehículo (debe verse la placa según requisitos)
  const selectVehiclePhoto = () => {
    const sampleCars = [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
    ];
    const randomCar = sampleCars[Math.floor(Math.random() * sampleCars.length)];
    updateVehicleData({ vehiclePhoto: randomCar });
    markTouched('vehiclePhoto');
  };

  const handlePlateChange = (text) => {
    const upperText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    updateVehicleData({ licensePlate: upperText });
    markTouched('licensePlate');
  };

  return (
    <FormScreen
      footer={
        <StepFooter
          step={2}
          onBack={() => navigation.navigate('PersonalData')}
          onNext={() => navigation.navigate('Documents')}
          disabled={!isVehicleValid}
          hint="Completa los datos del vehículo para continuar"
        />
      }
    >
      <Text style={styles.sectionTitle}>Información de tu vehículo</Text>
      <Text style={styles.sectionSubtitle}>
        Registra el vehículo con el cual prestarás el servicio en ViaMax
      </Text>

      <View style={styles.photoSection}>
        <TouchableOpacity
          style={styles.vehiclePhotoButton}
          onPress={selectVehiclePhoto}
          accessibilityRole="button"
          accessibilityLabel="Seleccionar foto del vehículo"
        >
          {vehicleData.vehiclePhoto ? (
            <Image source={{ uri: vehicleData.vehiclePhoto }} style={styles.vehiclePhotoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="car-outline" size={44} color={colors.textSoft} />
              <Text style={styles.photoText}>Subir Foto del Vehículo</Text>
              <Text style={styles.photoSubText}>Asegúrate de que la placa sea visible</Text>
            </View>
          )}
        </TouchableOpacity>
        {touched.vehiclePhoto && vehicleErrors.vehiclePhoto ? (
          <Text style={styles.photoError}>{vehicleErrors.vehiclePhoto}</Text>
        ) : null}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Categoría del Servicio</Text>
        <View style={styles.categoryOptions}>
          {VEHICLE_CATEGORIES.map((catKey) => (
            <TouchableOpacity
              key={catKey}
              style={[
                styles.categoryButton,
                vehicleData.category === catKey && styles.categoryButtonActive,
              ]}
              onPress={() => {
                const newCap =
                  catKey === 'xl' && parseInt(vehicleData.passengerCapacity, 10) < 6
                    ? '6'
                    : vehicleData.passengerCapacity;
                updateVehicleData({ category: catKey, passengerCapacity: newCap });
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: vehicleData.category === catKey }}
            >
              <Text
                style={[
                  styles.categoryText,
                  vehicleData.category === catKey && styles.categoryTextActive,
                ]}
              >
                {CATEGORY_LABELS[catKey]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <InputField
        label="Número de Placa (Formato Colombiano)"
        placeholder="ABC123"
        value={vehicleData.licensePlate}
        onChangeText={handlePlateChange}
        error={touched.licensePlate ? vehicleErrors.licensePlate : null}
        autoCapitalize="characters"
        maxLength={6}
        helperText="3 letras seguidas de 3 números (sin espacios)"
        returnKeyType="next"
      />

      <View style={styles.row}>
        <View style={styles.halfCol}>
          <InputField
            label="Marca"
            placeholder="Ej. Chevrolet"
            value={vehicleData.brand}
            onChangeText={(text) => {
              updateVehicleData({ brand: text });
              markTouched('brand');
            }}
            error={touched.brand ? vehicleErrors.brand : null}
            maxLength={30}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>
        <View style={styles.halfCol}>
          <InputField
            label="Modelo"
            placeholder="Ej. Onix"
            value={vehicleData.model}
            onChangeText={(text) => {
              updateVehicleData({ model: text });
              markTouched('model');
            }}
            error={touched.model ? vehicleErrors.model : null}
            maxLength={30}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.halfCol}>
          <InputField
            label="Año del Modelo"
            placeholder="Ej. 2022"
            value={vehicleData.year}
            onChangeText={(text) => {
              updateVehicleData({ year: text.replace(/[^0-9]/g, '') });
              markTouched('year');
            }}
            error={touched.year ? vehicleErrors.year : null}
            keyboardType="numeric"
            maxLength={4}
            returnKeyType="next"
          />
        </View>
        <View style={styles.halfCol}>
          <InputField
            label="Capacidad Pasajeros"
            placeholder="Ej. 4"
            value={vehicleData.passengerCapacity}
            onChangeText={(text) => {
              updateVehicleData({ passengerCapacity: text.replace(/[^0-9]/g, '') });
              markTouched('passengerCapacity');
            }}
            error={touched.passengerCapacity ? vehicleErrors.passengerCapacity : null}
            keyboardType="numeric"
            maxLength={2}
            helperText={vehicleData.category === 'xl' ? 'Mínimo 6 para XL' : null}
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Color del Vehículo</Text>
        <View style={styles.colorOptions}>
          {commonColors.map((col) => (
            <TouchableOpacity
              key={col}
              style={[
                styles.colorPill,
                !isCustomColor && vehicleData.color === col && styles.colorPillActive,
              ]}
              onPress={() => {
                setIsCustomColor(false);
                updateVehicleData({ color: col });
                markTouched('color');
              }}
              accessibilityRole="radio"
              accessibilityState={{
                selected: !isCustomColor && vehicleData.color === col,
              }}
            >
              <Text
                style={[
                  styles.colorText,
                  !isCustomColor && vehicleData.color === col && styles.colorTextActive,
                ]}
              >
                {col}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.colorPill, isCustomColor && styles.colorPillActive]}
            onPress={() => {
              setIsCustomColor(true);
              if (commonColors.includes(vehicleData.color)) {
                updateVehicleData({ color: '' });
              }
              markTouched('color');
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: isCustomColor }}
          >
            <Text style={[styles.colorText, isCustomColor && styles.colorTextActive]}>
              + Otro
            </Text>
          </TouchableOpacity>
        </View>

        {isCustomColor ? (
          <View style={{ marginTop: spacing.sm }}>
            <InputField
              placeholder="Escribe el color (ej. Vinotinto, Dorado)"
              value={vehicleData.color}
              onChangeText={(text) => {
                updateVehicleData({ color: text });
                markTouched('color');
              }}
              error={touched.color ? vehicleErrors.color : null}
              autoCapitalize="words"
              maxLength={20}
              returnKeyType="done"
            />
          </View>
        ) : null}
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
  vehiclePhotoButton: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  vehiclePhotoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  photoText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  photoSubText: {
    color: colors.textSoft,
    fontSize: 12,
    marginTop: 2,
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
  categoryOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  categoryText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfCol: {
    flex: 1,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorPill: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  colorPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  colorText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  colorTextActive: {
    color: colors.primary,
  },
});
