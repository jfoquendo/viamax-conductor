// Comunicación con el backend de pagos (Mercado Pago Checkout Pro).
// La app solo recibe la URL de pago: el access token vive en el servidor.

// Cambiar segun el entorno:
//  - emulador Android: http://10.0.2.2:3000
//  - dispositivo fisico: URL de ngrok o la IP de tu PC
export const PAYMENTS_API_URL = 'http://10.0.2.2:3000';

// Crea la preferencia de pago y devuelve la URL del checkout.
export async function createPaymentPreference(tripId) {
  if (!tripId) {
    throw new Error('Falta el identificador del viaje');
  }

  let response;
  try {
    response = await fetch(`${PAYMENTS_API_URL}/payments/preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId }),
    });
  } catch (networkError) {
    throw new Error(
      'No se pudo conectar con el servidor de pagos. Verifica que este activo.'
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error ?? `Error del servidor de pagos (${response.status})`);
  }

  const initPoint = payload?.sandboxInitPoint ?? payload?.initPoint;
  if (!initPoint) {
    throw new Error('El servidor no devolvio la URL de pago');
  }

  return { initPoint, preferenceId: payload.preferenceId };
}

// Pregunta al backend si el viaje ya fue pagado con tarjeta.
// Se usa al volver del navegador, cuando el webhook pudo no haber llegado.
export async function checkTripPaymentStatus(tripId) {
  if (!tripId) return { paid: false };

  try {
    const response = await fetch(`${PAYMENTS_API_URL}/payments/status/${tripId}`);
    if (!response.ok) return { paid: false };
    return await response.json();
  } catch (error) {
    return { paid: false };
  }
}

// Comprueba rapido si el backend responde.
export async function checkPaymentsHealth() {
  try {
    const response = await fetch(`${PAYMENTS_API_URL}/health`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}
