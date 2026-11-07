// Utilidades de fecha sin problemas de zona horaria.
// Se trabaja siempre con fechas "solo día" en formato YYYY-MM-DD.

const pad = (n) => String(n).padStart(2, '0');

// Convierte 'YYYY-MM-DD' a Date local a medianoche, o null si es inválida.
export function parseDateOnly(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // Rechaza fechas imposibles (2026-02-31 -> 2026-03-03).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

// Date -> 'YYYY-MM-DD'
export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 'YYYY-MM-DD' -> 'DD/MM/AAAA' para mostrar al usuario.
export function toDisplayDate(value) {
  const date = parseDateOnly(value);
  if (!date) return '';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// Medianoche de hoy.
export function todayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Suma (o resta) días a una fecha.
export function addDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Suma años a una fecha.
export function addYears(date, years) {
  const copy = new Date(date.getTime());
  copy.setFullYear(copy.getFullYear() + years);
  return copy;
}

// Edad exacta en años a una fecha dada.
export function calculateAge(birthDate, reference = new Date()) {
  let age = reference.getFullYear() - birthDate.getFullYear();
  const monthDiff = reference.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}
