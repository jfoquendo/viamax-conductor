import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  validateBirthDate,
  validateEmail,
  validateFullName,
  validateIdNumber,
  validateLicensePlate,
  validatePassengerCapacity,
  validatePassword,
  validatePasswordMatch,
  validatePhoneNumber,
  validateVehicleColor,
  validateVehicleYear,
  validateFutureDate,
} from '../utils/validators';

const RegistrationContext = createContext(null);

const INITIAL_PERSONAL = {
  profilePhoto: '',
  fullName: '',
  idNumber: '',
  phoneNumber: '',
  birthDate: '',
  gender: 'M',
  email: '',
  password: '',
  confirmPassword: '',
  language: 'es',
};

const INITIAL_VEHICLE = {
  category: 'economy',
  licensePlate: '',
  brand: '',
  model: '',
  year: '',
  color: 'Negro',
  passengerCapacity: '4',
  vehiclePhoto: '',
};

const INITIAL_DOCUMENTS = {
  driverLicenseNumber: '',
  driverLicensePhoto: '',
  driverLicenseExpiry: '',
  soatPhoto: '',
  soatExpiry: '',
  techReviewPhoto: '',
  techReviewExpiry: '',
  mercadoPagoEmail: '',
  acceptedTerms: false,
};

export function RegistrationProvider({ children }) {
  const [personalData, setPersonalData] = useState(INITIAL_PERSONAL);
  const [vehicleData, setVehicleData] = useState(INITIAL_VEHICLE);
  const [documentsData, setDocumentsData] = useState(INITIAL_DOCUMENTS);

  const updatePersonalData = useCallback((fields) => {
    setPersonalData((prev) => ({ ...prev, ...fields }));
  }, []);

  const updateVehicleData = useCallback((fields) => {
    setVehicleData((prev) => ({ ...prev, ...fields }));
  }, []);

  const updateDocumentsData = useCallback((fields) => {
    setDocumentsData((prev) => ({ ...prev, ...fields }));
  }, []);

  // Errores calculados en tiempo real: Pestaña 1
  const personalErrors = useMemo(
    () => ({
      profilePhoto: !personalData.profilePhoto ? 'La foto de perfil es obligatoria' : null,
      fullName: validateFullName(personalData.fullName),
      idNumber: validateIdNumber(personalData.idNumber),
      phoneNumber: validatePhoneNumber(personalData.phoneNumber),
      birthDate: validateBirthDate(personalData.birthDate),
      email: validateEmail(personalData.email),
      password: validatePassword(personalData.password),
      confirmPassword: validatePasswordMatch(
        personalData.password,
        personalData.confirmPassword
      ),
    }),
    [personalData]
  );

  // Errores calculados en tiempo real: Pestaña 2
  const vehicleErrors = useMemo(
    () => ({
      licensePlate: validateLicensePlate(vehicleData.licensePlate),
      brand:
        vehicleData.brand.trim().length > 0 && vehicleData.brand.length <= 30
          ? null
          : 'La marca es obligatoria (máximo 30 caracteres)',
      model:
        vehicleData.model.trim().length > 0 && vehicleData.model.length <= 30
          ? null
          : 'El modelo es obligatorio (máximo 30 caracteres)',
      year: validateVehicleYear(vehicleData.year),
      color: validateVehicleColor(vehicleData.color),
      passengerCapacity: validatePassengerCapacity(
        vehicleData.passengerCapacity,
        vehicleData.category
      ),
      vehiclePhoto: !vehicleData.vehiclePhoto ? 'La foto del vehículo es obligatoria' : null,
    }),
    [vehicleData]
  );

  // Errores calculados en tiempo real: Pestaña 3
  const documentsErrors = useMemo(() => {
    // La técnico-mecánica aplica si el vehículo tiene 5 años o más.
    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(vehicleData.year, 10);
    const vehicleYearNum = Number.isFinite(parsedYear) ? parsedYear : null;
    const requiresTechReview =
      vehicleYearNum !== null && currentYear - vehicleYearNum >= 5;

    return {
      driverLicenseNumber: !documentsData.driverLicenseNumber.trim()
        ? 'El número de licencia es obligatorio'
        : null,
      driverLicensePhoto: !documentsData.driverLicensePhoto
        ? 'La foto de la licencia es obligatoria'
        : null,
      driverLicenseExpiry: validateFutureDate(
        documentsData.driverLicenseExpiry,
        'La licencia de conducción'
      ),
      soatPhoto: !documentsData.soatPhoto ? 'La foto del SOAT es obligatoria' : null,
      soatExpiry: validateFutureDate(documentsData.soatExpiry, 'El SOAT'),
      techReviewPhoto:
        requiresTechReview && !documentsData.techReviewPhoto
          ? 'La foto de la técnico-mecánica es obligatoria'
          : null,
      techReviewExpiry: requiresTechReview
        ? validateFutureDate(documentsData.techReviewExpiry, 'La técnico-mecánica')
        : null,
      mercadoPagoEmail: validateEmail(documentsData.mercadoPagoEmail),
      acceptedTerms: !documentsData.acceptedTerms
        ? 'Debes aceptar los términos y condiciones'
        : null,
    };
  }, [documentsData, vehicleData.year]);

  const isPersonalValid = useMemo(
    () => Object.values(personalErrors).every((error) => error === null),
    [personalErrors]
  );

  const isVehicleValid = useMemo(
    () => Object.values(vehicleErrors).every((error) => error === null),
    [vehicleErrors]
  );

  const isDocumentsValid = useMemo(
    () => Object.values(documentsErrors).every((error) => error === null),
    [documentsErrors]
  );

  const canSubmitRegistration =
    isPersonalValid && isVehicleValid && isDocumentsValid;

  const resetRegistration = useCallback(() => {
    setPersonalData(INITIAL_PERSONAL);
    setVehicleData(INITIAL_VEHICLE);
    setDocumentsData(INITIAL_DOCUMENTS);
  }, []);

  const value = useMemo(
    () => ({
      personalData,
      vehicleData,
      documentsData,
      updatePersonalData,
      updateVehicleData,
      updateDocumentsData,
      personalErrors,
      vehicleErrors,
      documentsErrors,
      isPersonalValid,
      isVehicleValid,
      isDocumentsValid,
      canSubmitRegistration,
      resetRegistration,
    }),
    [
      personalData,
      vehicleData,
      documentsData,
      updatePersonalData,
      updateVehicleData,
      updateDocumentsData,
      personalErrors,
      vehicleErrors,
      documentsErrors,
      isPersonalValid,
      isVehicleValid,
      isDocumentsValid,
      canSubmitRegistration,
      resetRegistration,
    ]
  );

  return (
    <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration debe usarse dentro de un RegistrationProvider');
  }
  return context;
}
