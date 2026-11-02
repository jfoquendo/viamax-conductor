

export const PRICING_CONFIG = {
  //Rarifas
  baseFare: {
    economy: 3500,    // Económico
    xl: 5000,         // categoría XL
    premium: 8000,    // categoría Premium
  },

  // Costo por kilómetro recorrido
  perKm: {
    economy: 1200,    //  km — Económico
    xl: 1600,         //  km — XL
    premium: 2200,    //  km — Premium
  },

  // Costo por minuto de viaje
  perMinute: {
    economy: 200,     //  minuto — Económico
    xl: 280,          //  minuto — XL
    premium: 400,     //  minuto — Premium
  },

  // Tarifa mínima garantizada por categoría
  minimumFare: {
    economy: 5000,    // Mínimo — Económico
    xl: 8000,         // Mínimo — XL
    premium: 15000,   // Mínimo — Premium
  },

  // Comisión de la plataforma (20%)
  commissionRate: 0.20,

  // Capacidad de pasajeros por categoría
  passengerCapacity: {
    economy: 4,       //  4 pasajeros — Económico
    xl: 6,            //  6 pasajeros — XL 
    premium: 4,       //  4 pasajeros — Premium
  },

  // Redondeo de tarifa al múltiplo más cercano 100 COP
  roundingUnit: 100,
};

// Categorías válidas de vehículo
export const VEHICLE_CATEGORIES = ['economy', 'xl', 'premium'];

// Etiquetas en  para mostrar al usuario
export const CATEGORY_LABELS = {
  economy: 'Económico',
  xl: 'XL',
  premium: 'Premium',
};