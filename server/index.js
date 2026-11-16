// Backend de pagos con asesoria de IA (docs/AI_LOG.md #21).
// Backend de pagos de ViaMax (Mercado Pago Checkout Pro).
// La app nunca ve el access token: solo recibe la URL de pago.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { sendTripRequestNotification } = require('./notifications');

const app = express();
app.use(cors());
app.use(express.json());

// --- Firebase Admin ---------------------------------------------------------
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('Falta FIREBASE_SERVICE_ACCOUNT en server/.env');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.FIREBASE_SERVICE_ACCOUNT)),
});

const db = admin.firestore();

// --- Mercado Pago -----------------------------------------------------------
// El entorno se declara explicitamente en MP_ENV. No se deduce del prefijo
// del token: Mercado Pago puede entregar tokens APP_USR en modo prueba.
const MP_ENV = (process.env.MP_ENV || '').toLowerCase();

if (!['test', 'production'].includes(MP_ENV)) {
  console.error('MP_ENV debe ser "test" o "production" en server/.env');
  process.exit(1);
}

const IS_TEST = MP_ENV === 'test';
const ACCESS_TOKEN = IS_TEST
  ? process.env.MP_ACCESS_TOKEN_TEST
  : process.env.MP_ACCESS_TOKEN_PROD;

if (!ACCESS_TOKEN) {
  console.error(
    `Falta ${IS_TEST ? 'MP_ACCESS_TOKEN_TEST' : 'MP_ACCESS_TOKEN_PROD'} en server/.env (MP_ENV=${MP_ENV})`
  );
  process.exit(1);
}

const mpClient = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
});

const BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

// --- Rutas ------------------------------------------------------------------

app.get('/health', (req, res) => {
  res.json({ ok: true, mode: MP_ENV, sandbox: IS_TEST });
});

/**
 * Notifica a los conductores disponibles que hay una solicitud nueva.
 * Body: { tripId }
 * Se puede llamar desde el dispatch, desde la app del pasajero o a mano.
 */
app.post('/notifications/trip', async (req, res) => {
  const { tripId } = req.body ?? {};

  if (!tripId || typeof tripId !== 'string') {
    return res.status(400).json({ error: 'Falta tripId' });
  }

  try {
    const result = await sendTripRequestNotification(db, tripId);
    console.log('[notifications]', tripId, JSON.stringify(result));
    return res.json(result);
  } catch (error) {
    console.error('[notifications]', error?.message ?? error);
    return res.status(500).json({ error: 'No se pudo enviar la notificacion' });
  }
});

/**
 * Crea una preferencia de pago para un viaje.
 * Body: { tripId }
 */
app.post('/payments/preference', async (req, res) => {
  const { tripId } = req.body ?? {};

  if (!tripId || typeof tripId !== 'string') {
    return res.status(400).json({ error: 'Falta tripId' });
  }

  try {
    const tripRef = db.collection('trips').doc(tripId);
    const snapshot = await tripRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    const trip = snapshot.data();

    if (trip.status === 'paid') {
      return res.status(409).json({ error: 'El viaje ya fue pagado' });
    }

    const total = Number(trip.total) || 0;
    if (total <= 0) {
      return res.status(400).json({ error: 'El viaje no tiene monto a cobrar' });
    }

    // Guarda la referencia de pago antes de redirigir.
    await tripRef.set(
      {
        paymentProvider: 'mercadopago',
        paymentMethod: 'card',
        paymentStatus: 'pending',
      },
      { merge: true }
    );

    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [
          {
            id: tripId,
            title: 'Viaje ViaMax',
            description: trip.destination?.address ?? 'Servicio de transporte',
            quantity: 1,
            unit_price: total,
            currency_id: 'COP',
          },
        ],
        external_reference: tripId,
        back_urls: {
          success: `${BASE_URL}/payments/result?status=success&tripId=${tripId}`,
          failure: `${BASE_URL}/payments/result?status=failure&tripId=${tripId}`,
          pending: `${BASE_URL}/payments/result?status=pending&tripId=${tripId}`,
        },
        notification_url: `${BASE_URL}/payments/webhook`,
        statement_descriptor: 'VIAMAX',
      },
    });

    await tripRef.set(
      { paymentPreferenceId: result.id, paymentInitPoint: result.init_point },
      { merge: true }
    );

    return res.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point ?? result.init_point,
    });
  } catch (error) {
    console.error('[preference]', error?.message ?? error);
    return res.status(500).json({ error: 'No se pudo crear la preferencia de pago' });
  }
});

/**
 * Webhook de Mercado Pago. Marca el viaje como pagado.
 */
app.post('/payments/webhook', async (req, res) => {
  // Se responde rapido: Mercado Pago reintenta si tardamos.
  res.sendStatus(200);

  try {
    const paymentId = req.query['data.id'] ?? req.body?.data?.id;
    if (!paymentId) return;

    const payment = new Payment(mpClient);
    const detail = await payment.get({ id: paymentId });

    if (detail.status !== 'approved') return;

    const tripId = detail.external_reference;
    if (!tripId) return;

    await db.collection('trips').doc(tripId).set(
      {
        status: 'paid',
        paymentProvider: 'mercadopago',
        paymentMethod: 'card',
        paymentStatus: 'approved',
        paymentId: String(paymentId),
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log('[webhook] viaje pagado:', tripId);
  } catch (error) {
    console.error('[webhook]', error?.message ?? error);
  }
});

/**
 * Consulta activa del estado de pago de un viaje.
 * La app la llama al volver del navegador. Si Mercado Pago ya aprobo el pago,
 * se marca el viaje como pagado aunque el webhook no haya llegado.
 */
app.get('/payments/status/:tripId', async (req, res) => {
  const { tripId } = req.params;

  if (!tripId) {
    return res.status(400).json({ error: 'Falta tripId' });
  }

  try {
    const tripRef = db.collection('trips').doc(tripId);
    const snapshot = await tripRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: 'Viaje no encontrado' });
    }

    const trip = snapshot.data();

    // Ya esta pagado: responde sin consultar a Mercado Pago.
    if (trip.status === 'paid') {
      return res.json({ paid: true, status: 'paid' });
    }

    // Busca pagos aprobados asociados al viaje.
    const searchResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(tripId)}&sort=date_created&criteria=desc&limit=5`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );

    if (!searchResponse.ok) {
      return res.json({ paid: false, status: trip.paymentStatus ?? 'pending' });
    }

    const searchData = await searchResponse.json();
    const approved = (searchData.results ?? []).find(
      (payment) => payment.status === 'approved'
    );

    if (!approved) {
      return res.json({ paid: false, status: trip.paymentStatus ?? 'pending' });
    }

    await tripRef.set(
      {
        status: 'paid',
        paymentProvider: 'mercadopago',
        paymentMethod: 'card',
        paymentStatus: 'approved',
        paymentId: String(approved.id),
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log('[status] viaje pagado por consulta:', tripId);
    return res.json({ paid: true, status: 'paid' });
  } catch (error) {
    console.error('[status]', error?.message ?? error);
    return res.status(500).json({ error: 'No se pudo consultar el pago' });
  }
});

// Pagina simple de retorno tras el checkout.
app.get('/payments/result', (req, res) => {
  const { status, tripId } = req.query;
  res.send(`<!doctype html><html><body style="font-family:sans-serif;background:#0A0A0A;color:#fff;text-align:center;padding:48px">
  <h2>ViaMax</h2>
  <p>Estado del pago: <strong>${status ?? 'desconocido'}</strong></p>
  <p>Viaje: ${tripId ?? '-'}</p>
  <p>Puedes volver a la aplicación.</p>
  </body></html>`);
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`ViaMax payments en http://localhost:${port}`);
  console.log(`Modo: ${MP_ENV.toUpperCase()}`);
});
