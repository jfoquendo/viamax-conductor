
export const colors = {
  // Fondos
  background: '#0A0A0A',       //Fondo principal
  cardBackground: '#1A1A1A',   // tarjetas y modales
  surface: '#242424',          // inputs, elementos elevados

  // Texto
  text: '#FFFFFF',             // texto principal
  textSoft: '#A0A0A0',         // texto secundario, placeholders
  textInverse: '#0A0A0A',      // texto sobre fondos claros

  // Color primario de marca
  primary: '#00C853',          // disponible, confirmar, éxito
  primarySoft: '#1B4332',      // fondo de badges verdes

  // Estados
  warning: '#FFD600',          // advertencias, viaje en curso
  warningSoft: '#3D3000',      // fondo de badges amarillos
  danger: '#FF3B30',           // cancelar, peligro, errores
  dangerSoft: '#3D0000',       // fondo de badges rojos

  // Bordes y separadores
  border: '#2C2C2C',           // separadores
  borderLight: '#404040',      // bordes de inputs

  // Especiales
  accent: '#FFFFFF',           // íconos activos, highlights
  shadow: '#000000',           // sombras
  overlay: 'rgba(0,0,0,0.6)', // modales
};

// Espaciado consistente en toda la app
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Escala de bordes redondeados
export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
};

// Escala tipográfica
export const typography = {
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

// Sombras para tarjetas elevadas
export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  modal: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 16,
  },
};

export default {
  colors,
  spacing,
  radius,
  typography,
  shadows,
};