import { PRICING_CONFIG, roundFare } from '../config/pricing';

/**
 * Calcula la tarifa de un viaje.
 * @param {object} params
 * @param {number} params.distanceKm  Distancia del recorrido en kilómetros.
 * @param {number} params.durationMin Duración estimada en minutos.
 * @param {'economy'|'xl'|'premium'} [params.category] Categoría del servicio.
 * @param {number} [params.tip] Propina opcional (va completa al conductor).
 * @returns {{fare:number, commission:number, driverEarnings:number,
 *            baseFare:number, distanceCost:number, timeCost:number,
 *            subtotal:number, category:string, commissionRate:number,
 *            tip:number, total:number}}
 */
export function calculateFare({
  distanceKm = 0,
  durationMin = 0,
  category = 'economy',
  tip = 0,
} = {}) {
  const config = PRICING_CONFIG;
  const multiplier = config.categoryMultiplier[category];

  if (!multiplier) {
    throw new Error(`Categoría de vehículo desconocida: ${category}`);
  }

  const distance = Number(distanceKm);
  const duration = Number(durationMin);
  if (!Number.isFinite(distance) || distance < 0) {
    throw new Error('La distancia debe ser un número mayor o igual a cero');
  }
  if (!Number.isFinite(duration) || duration < 0) {
    throw new Error('La duración debe ser un número mayor o igual a cero');
  }

  const safeTip = Number(tip) > 0 ? Number(tip) : 0;

  // Desglose antes del multiplicador y del mínimo.
  const baseFare = config.baseFare;
  const distanceCost = distance * config.perKm;
  const timeCost = duration * config.perMinute;

  // Mínimo garantizado antes de aplicar la categoría.
  const subtotal = Math.max(baseFare + distanceCost + timeCost, config.minimumFare);

  // La tarifa se redondea; la propina se suma después, sin tocarla.
  const fare = roundFare(subtotal * multiplier);

  // La comisión no se redondea: el documento usa el valor exacto.
  const commission = Math.round(fare * config.commissionRate);

  return {
    fare,
    commission,
    driverEarnings: fare - commission + safeTip,
    baseFare,
    distanceCost,
    timeCost,
    subtotal,
    category,
    commissionRate: config.commissionRate,
    tip: safeTip,
    total: fare + safeTip,
  };
}

export default calculateFare;
