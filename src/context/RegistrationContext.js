
import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  validateFullName,
  validateIdNumber,
  validatePhoneNumber,
  validateBirthDate,
  validateEmail,
  validateLicensePlate,
  validateVehicleYear,
  validatePassengerCapacity,
  validateFutureDate,
} from '../utils/validators';

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  // Pestaña 1: Datos Personales
  const [personalData, setPersonalData] = useState({
    profilePhoto: '',       // URI o URL de la foto de perfil
    fullName: '',           // Nombre completo
    idNumber: '',           // Cédula de ciudadanía
    phoneNumber: '',        // Teléfono celular
    birthDate: '',          // Fecha de nacimiento (AAAA-MM-DD)
    gender: 'M',            // 'M' | 'F' | 'Otro'
    email: '',              // Correo electrónico
    language: 'es',         // 'es' | 'en'
  });

  // Pestaña 2: Datos del Vehículo
  const [vehicleData, setVehicleData] = useState({
    category: 'economy',    // 'economy' | 'xl' | 'premium'
    licensePlate: '',       // Placa (ABC123)
    brand: '',              // Marca (ej. Chevrolet)
    model: '',              // Modelo (ej. Onix)
    year: '',               // Año (4 dígitos)
    color: 'Negro',         // Color
    passengerCapacity: '4', // Número de pasajeros
    vehiclePhoto: '',       // URI o URL de la foto del carro
  });

  // Pestaña 3: Documentos y Pagos
  const [documentsData, setDocumentsData] = useState({
    driverLicenseNumber: '',  // Número de licencia
    driverLicensePhoto: '',   // Foto de licencia
    driverLicenseExpiry: '',  // Vencimiento licencia
    soatPhoto: '',            // Foto SOAT
    soatExpiry: '',           // Vencimiento SOAT
    techReviewPhoto: '',      // Foto técnico-mecánica
    techReviewExpiry: '',     // Vencimiento técnico-mecánica
    mercadoPagoEmail: '',     // Correo de cuenta Mercado Pago
    acceptedTerms: false,     // Checkbox términos (comisión 20%)
  });

  // Actualizadores parciales para cada bloque
  const updatePersonalData = (fields) => {
    setPersonalData((prev) => ({ ...prev, ...fields }));
  };

  const updateVehicleData = (fields) => {
    setVehicleData((prev) => ({ ...prev, ...fields }));
  };

  const updateDocumentsData = (fields) => {
    setDocumentsData((prev) => ({ ...prev, ...fields }));
  };

  // Errores calculados en tiempo real: Pestaña 1
  const personalErrors = useMemo(() => {
    return {
      profilePhoto: !personalData.profilePhoto ? 'La foto de perfil es obligatoria' : null,
      fullName: validateFullName(personalData.fullName),
      idNumber: validateIdNumber(personalData.idNumber),
      phoneNumber: validatePhoneNumber(personalData.phoneNumber),
      birthDate: validateBirthDate(personalData.birthDate),
      email: validateEmail(personalData.email),
    };
  }, [personalData]);

  // Errores calculados en tiempo real: Pestaña 2
  const vehicleErrors = useMemo(() => {
    const isBrandValid = personalData && vehicleData.brand.trim().length > 0 && vehicleData.brand.length <= 30;
    const isModelValid = personalData && vehicleData.model.trim().length > 0 && vehicleData.model.length <= 30;

    return {
      licensePlate: validateLicensePlate(vehicleData.licensePlate),
      brand: !isBrandValid ? 'La marca es obligatoria (máximo 30 caracteres)' : null,
      model: !isModelValid ? 'El modelo es obligatorio (máximo 30 caracteres)' : null,
      year: validateVehicleYear(vehicleData.year),
      passengerCapacity: validatePassengerCapacity(vehicleData.passengerCapacity, vehicleData.category),
      vehiclePhoto: !vehicleData.vehiclePhoto ? 'La foto del vehículo es obligatoria' : null,
    };
  }, [vehicleData, personalData]);

  // Errores calculados en tiempo real: Pestaña 3
  const documentsErrors = useMemo(() => {
    // La técnico-mecánica aplica si el vehículo tiene más de 5 años
    const currentYear = new Date().getFullYear();
    const vehicleYearNum = parseInt(vehicleData.year, 10) || currentYear;
    const requiresTechReview = (currentYear - vehicleYearNum) >= 5;

    return {
      driverLicenseNumber: !documentsData.driverLicenseNumber.trim() ? 'El número de licencia es obligatorio' : null,
      driverLicensePhoto: !documentsData.driverLicensePhoto ? 'La foto de la licencia es obligatoria' : null,
      driverLicenseExpiry: validateFutureDate(documentsData.driverLicenseExpiry, 'La licencia de conducción'),
      soatPhoto: !documentsData.soatPhoto ? 'La foto del SOAT es obligatoria' : null,
      soatExpiry: validateFutureDate(documentsData.soatExpiry, 'El SOAT'),
      techReviewPhoto: requiresTechReview && !documentsData.techReviewPhoto ? 'La foto de la técnico-mecánica es obligatoria' : null,
      techReviewExpiry: requiresTechReview ? validateFutureDate(documentsData.techReviewExpiry, 'La técnico-mecánica') : null,
      mercadoPagoEmail: validateEmail(documentsData.mercadoPagoEmail),
      acceptedTerms: !documentsData.acceptedTerms ? 'Debes aceptar los términos y condiciones' : null,
    };
  }, [documentsData, vehicleData.year]);

  // Validación global de cada pestaña
  const isPersonalValid = useMemo(() => {
    return Object.values(personalErrors).every((err) => err === null);
  }, [personalErrors]);

  const isVehicleValid = useMemo(() => {
    return Object.values(vehicleErrors).every((err) => err === null);
  }, [vehicleErrors]);

  const isDocumentsValid = useMemo(() => {
    return Object.values(documentsErrors).every((err) => err === null);
  }, [documentsErrors]);

  // El botón "Enviar registro" solo se activa cuando las 3 pestañas son válidas
  const canSubmitRegistration = isPersonalValid && isVehicleValid && isDocumentsValid;

  const markRegistrationCompleted = () => {
    setRegistrationCompleted(true);
  };

  return (
    <RegistrationContext.Provider
      value={{
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
        registrationCompleted,
        markRegistrationCompleted,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

// Hook de acceso al contexto con validación de provider
export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration debe usarse dentro de un RegistrationProvider');
  }
  return context;
}