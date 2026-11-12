import { calculateAge, parseDateOnly, todayStart } from './date';

// Valida nombre completo: máximo 50 caracteres, solo letras y espacios
export const validateFullName = (name) => {
  if (!name || !name.trim()) return 'El nombre completo es obligatorio';
  if (name.trim().length > 50) return 'El nombre no puede exceder 50 caracteres';
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  if (!nameRegex.test(name.trim())) return 'Solo se permiten letras y espacios';
  return null;
};

// Valida documento de identidad: numérico, entre 6 y 10 dígitos
export const validateIdNumber = (id) => {
  if (!id || !id.trim()) return 'El documento de identidad es obligatorio';
  const digits = id.trim();
  if (!/^\d+$/.test(digits)) return 'El documento debe ser solo numérico';
  if (digits.length < 6 || digits.length > 10) return 'Debe tener entre 6 y 10 dígitos';
  return null;
};

// Valida número de celular: numérico, 10 dígitos exactos
export const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) return 'El número de celular es obligatorio';
  const digits = phone.trim();
  if (!/^\d+$/.test(digits)) return 'El celular debe ser solo numérico';
  if (digits.length !== 10) return 'Debe tener exactamente 10 dígitos';
  return null;
};

// Valida fecha de nacimiento: fecha real, no futura, edad entre 18 y 100 años
export const validateBirthDate = (date) => {
  if (!date) return 'La fecha de nacimiento es obligatoria';

  const birth = parseDateOnly(date);
  if (!birth) return 'Usa el formato AAAA-MM-DD con una fecha válida';

  const today = todayStart();
  if (birth > today) return 'La fecha de nacimiento no puede ser futura';

  const age = calculateAge(birth, today);
  if (age < 18) return 'El conductor debe ser mayor de 18 años';
  if (age > 100) return 'Revisa la fecha de nacimiento';

  return null;
};

// Valida correo electrónico con @ y dominio
export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'El correo electrónico es obligatorio';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Ingresa un correo electrónico válido';
  return null;
};

// Valida contraseña: mínimo 8 caracteres, al menos una letra y un número
export const validatePassword = (password) => {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[A-Za-z]/.test(password)) return 'Debe incluir al menos una letra';
  if (!/\d/.test(password)) return 'Debe incluir al menos un número';
  return null;
};

export const validatePasswordMatch = (password, confirmation) => {
  if (!confirmation) return 'Confirma la contraseña';
  if (password !== confirmation) return 'Las contraseñas no coinciden';
  return null;
};

// Valida placa de vehículo particular colombiana (formato ABC123)
export const validateLicensePlate = (plate) => {
  if (!plate || !plate.trim()) return 'La placa es obligatoria';
  const cleanPlate = plate.trim().toUpperCase();
  const plateRegex = /^[A-Z]{3}\d{3}$/;
  if (!plateRegex.test(cleanPlate)) return 'Formato inválido. Debe ser como ABC123';
  return null;
};

// Valida año del vehículo: numérico de 4 dígitos, no mayor al año actual
export const validateVehicleYear = (year) => {
  if (!year || !String(year).trim()) return 'El año del vehículo es obligatorio';
  const strYear = String(year).trim();
  if (!/^\d{4}$/.test(strYear)) return 'Debe ser un año de 4 dígitos';

  const numYear = parseInt(strYear, 10);
  const currentYear = new Date().getFullYear();
  if (numYear > currentYear) return `El año no puede ser mayor a ${currentYear}`;
  if (numYear < 1990) return 'El vehículo es demasiado antiguo';
  return null;
};

// Valida capacidad de pasajeros (si es XL exige mínimo 6)
export const validatePassengerCapacity = (capacity, category) => {
  if (!capacity || !String(capacity).trim()) return 'La capacidad es obligatoria';
  const num = parseInt(capacity, 10);
  if (isNaN(num) || num <= 0) return 'Debe ser un número mayor a cero';
  if (num > 8) return 'La capacidad máxima es 8 pasajeros';
  if (category === 'xl' && num < 6) return 'La categoría XL exige mínimo 6 pasajeros';
  return null;
};

// Valida el color del vehículo (selector rápido o texto libre)
export const validateVehicleColor = (color) => {
  if (!color || !String(color).trim()) return 'El color es obligatorio';
  if (String(color).trim().length > 20) return 'Máximo 20 caracteres';
  return null;
};

// Valida fecha futura (licencias, SOAT y técnico-mecánica)
export const validateFutureDate = (date, fieldName = 'El documento') => {
  if (!date) return `${fieldName} es obligatorio`;

  const parsed = parseDateOnly(date);
  if (!parsed) return `${fieldName} tiene una fecha inválida`;

  const today = todayStart();
  if (parsed <= today) return `${fieldName} se encuentra vencido`;

  return null;
};
