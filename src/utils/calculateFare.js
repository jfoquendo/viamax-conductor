
import { PRICING_CONFIG } from '../config/pricing';

/**
 * Calcula la tarifa total de un viaje.
 * @param {number} distanceKm 
 * @param {number} durationMin 
 * @param {string} category 
 * @param {number} tip 
 * @returns {object} 
 */
export function calculateFare(distanceKm, durationMin, category = 'economy', tip = 0) {
  const config = PRICING_CONFIG;

  // Calcular cada componente de la tarifa
  const baseFare = config.baseFare[category];
  const distanceCost = distanceKm * config.perKm[category];
  const timeCost = durationMin * config.perMinute[category];
  const subtotal = baseFare + distanceCost + timeCost + tip;

  // Aplicar tarifa mínima si corresponde
  const fareBeforeRounding = Math.max(subtotal, config.minimumFare[category]);

  // Redondear al múltiplo de 100 COP más cercano
  const totalFare = Math.round(fareBeforeRounding / config.roundingUnit) * config.roundingUnit;

  // Calcular comisión de la plataforma 
  const platformCommission = Math.round((totalFare * config.commissionRate) / config.roundingUnit) * config.roundingUnit;

  // Ganancia neta del conductor
  const driverEarnings = totalFare - platformCommission;

  return {
    baseFare,           
    distanceCost,       
    timeCost,           
    tip,                
    totalFare,          
    platformCommission, 
    driverEarnings,     
    category,           
    commissionRate: config.commissionRate, 
  };
}