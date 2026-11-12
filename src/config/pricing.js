// Configuración de tarifas de ViaMax.
// Modelo único para todas las categorías: base + distancia + tiempo,
// multiplicado por la categoría y con un mínimo garantizado.

export const PRICING_CONFIG = {
  // Tarifa base que cubre el abordaje.
  baseFare: 3500,

  // Costo por kilómetro y por minuto de viaje.
  perKm: 1200,
  perMinute: 250,

  // Multiplicador por categoría de servicio.
  categoryMultiplier: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },

  // Tarifa mínima garantizada (antes del multiplicador).
  minimumFare: 6000,

  // Comisión de la plataforma sobre la tarifa (la propina no se comisiona).
  commissionRate: 0.2,

  // Redondeo de la tarifa al múltiplo más cercano de 100 COP.
  roundingUnit: 100,

  // Capacidad de pasajeros por categoría.
  passengerCapacity: {
    economy: 4,
    xl: 6,
    premium: 4,
  },
};

// Categorías válidas de vehículo.
export const VEHICLE_CATEGORIES = ['economy', 'xl', 'premium'];

// Etiquetas para mostrar en la interfaz.
export const CATEGORY_LABELS = {
  economy: 'Económico',
  xl: 'XL',
  premium: 'Premium',
};

// Redondea al múltiplo de 100 COP más cercano.
export const roundFare = (value) =>
  Math.round(value / PRICING_CONFIG.roundingUnit) * PRICING_CONFIG.roundingUnit;
