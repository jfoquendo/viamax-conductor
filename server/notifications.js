// Envio de notificaciones con asesoria de IA (docs/AI_LOG.md #20).
// Envio de notificaciones push a los conductores disponibles.
// Usa FCM a traves de firebase-admin: funciona con la app abierta,
// en segundo plano o cerrada.
const admin = require('firebase-admin');

// Colecciones usadas por el backend.
const DRIVERS = 'drivers';
const LOCATIONS = 'driver_locations';

// Un conductor se considera disponible si publico su ubicacion
// en los ultimos 60 segundos.
const AVAILABILITY_WINDOW_MS = 60 * 1000;

// Selecciona conductores disponibles con token push registrado.
async function findAvailableDrivers(db, { category } = {}) {
  const now = Date.now();
  const locations = await db.collection(LOCATIONS).where('isAvailable', '==', true).get();

  const activos = locations.docs
    .map((doc) => {
      const data = doc.data();
      const updated = data.updatedAt?.toMillis?.() ?? 0;
      return { uid: doc.id, ...data, updated };
    })
    .filter((item) => now - item.updated < AVAILABILITY_WINDOW_MS);

  if (activos.length === 0) return [];

  const conductores = await Promise.all(
    activos.map(async (item) => {
      const snapshot = await db.collection(DRIVERS).doc(item.uid).get();
      if (!snapshot.exists) return null;

      const profile = snapshot.data();
      if (profile.status !== 'approved') return null;
      if (!profile.pushToken) return null;

      // Si el viaje pide categoria y el vehiculo no coincide, se descarta.
      if (category && profile.vehicle?.category !== category) return null;

      return { uid: item.uid, token: profile.pushToken };
    })
  );

  return conductores.filter(Boolean);
}

// Envia la notificacion de una solicitud nueva.
// Devuelve un resumen del envio para registrarlo en los logs.
async function sendTripRequestNotification(db, tripId) {
  const tripSnapshot = await db.collection('trips').doc(tripId).get();

  if (!tripSnapshot.exists) {
    return { sent: 0, reason: 'trip-not-found' };
  }

  const trip = tripSnapshot.data();

  if (trip.status !== 'requested') {
    return { sent: 0, reason: 'trip-not-requested' };
  }

  const skippedBy = Array.isArray(trip.skippedBy) ? trip.skippedBy : [];
  const candidatos = await findAvailableDrivers(db, { category: trip.category });

  // No se molesta a quien ya descarto esta solicitud.
  const destinatarios = candidatos.filter((item) => !skippedBy.includes(item.uid));

  if (destinatarios.length === 0) {
    return { sent: 0, reason: 'no-available-drivers' };
  }

  const origen = trip.origin?.address ?? 'Recogida';
  const destino = trip.destination?.address ?? 'Destino';

  const message = {
    tokens: destinatarios.map((item) => item.token),
    notification: {
      title: 'Nueva solicitud de viaje',
      body: origen + ' → ' + destino,
    },
    // Los datos permiten abrir la pantalla correcta al tocar el aviso.
    data: {
      tripId,
      type: 'trip-request',
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'trip-requests',
        sound: 'default',
        priority: 'max',
      },
    },
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  // Limpia tokens invalidos para no reintentar con dispositivos que ya no existen.
  const invalidos = [];
  response.responses.forEach((result, index) => {
    if (result.success) return;
    const code = result.error?.code ?? '';
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-argument' ||
      code === 'messaging/invalid-registration-token'
    ) {
      invalidos.push(destinatarios[index].uid);
    }
  });

  await Promise.all(
    invalidos.map((uid) =>
      db.collection(DRIVERS).doc(uid).set(
        { pushToken: admin.firestore.FieldValue.delete() },
        { merge: true }
      )
    )
  );

  return {
    sent: response.successCount,
    failed: response.failureCount,
    cleaned: invalidos.length,
    drivers: destinatarios.length,
  };
}

module.exports = { sendTripRequestNotification, findAvailableDrivers };
