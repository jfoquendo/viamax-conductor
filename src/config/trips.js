// Estados posibles de un viaje y utilidades de presentación.

export const TRIP_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAID: 'paid',
};

// Orden natural del ciclo de vida.
export const TRIP_FLOW = [
  TRIP_STATUS.REQUESTED,
  TRIP_STATUS.ACCEPTED,
  TRIP_STATUS.DRIVER_ARRIVING,
  TRIP_STATUS.IN_PROGRESS,
  TRIP_STATUS.COMPLETED,
  TRIP_STATUS.PAID,
];

// Estados que el conductor puede tomar desde la pantalla de solicitud.
export const ACTIVE_STATUSES = [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING, TRIP_STATUS.IN_PROGRESS];

// Tiempo máximo para responder una solicitud, en segundos.
export const REQUEST_TIMEOUT_SECONDS = 15;

export const TRIP_STATUS_LABELS = {
  [TRIP_STATUS.REQUESTED]: 'Solicitado',
  [TRIP_STATUS.ACCEPTED]: 'Aceptado',
  [TRIP_STATUS.DRIVER_ARRIVING]: 'En camino',
  [TRIP_STATUS.IN_PROGRESS]: 'En curso',
  [TRIP_STATUS.COMPLETED]: 'Finalizado',
  [TRIP_STATUS.CANCELLED]: 'Cancelado',
  [TRIP_STATUS.PAID]: 'Pagado',
};

// Formas de pago admitidas por el documento.
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Efectivo',
  [PAYMENT_METHODS.CARD]: 'Tarjeta',
};
