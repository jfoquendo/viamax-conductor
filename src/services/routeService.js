// Cálculo de rutas con la Routes API de Google.
// Se usa fetch directo (sin SDK extra). La clave se restringe por aplicación
// en Google Cloud, así que exponerla en el cliente es el patrón habitual.
import { Platform } from 'react-native';

const ROUTES_ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes';

// La misma clave que usa el mapa en app.json.
const MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

// Caché en memoria: evita repetir la misma consulta mientras el viaje dura.
const cache = new Map();

// Convierte un punto {latitude, longitude} al formato de la API.
export function toWaypoint(point) {
  return {
    location: {
      latLng: {
        latitude: point.latitude,
        longitude: point.longitude,
      },
    },
  };
}

// Decodifica el polyline codificado de Google a coordenadas.
// Algoritmo estándar: cada par de valores viene como delta en base 64.
export function decodePolyline(encoded) {
  if (!encoded) return [];

  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

// Construye la clave de caché con coordenadas redondeadas a 4 decimales (~11 m).
function cacheKey(origin, destination) {
  const round = (n) => Math.round(n * 10000) / 10000;
  return [
    round(origin.latitude),
    round(origin.longitude),
    round(destination.latitude),
    round(destination.longitude),
  ].join(',');
}

/**
 * Calcula la ruta entre dos puntos.
 * @returns {Promise<{points:Array<{latitude:number,longitude:number}>,
 *                    distanceKm:number, durationMin:number, cached:boolean}>}
 */
export async function fetchRoute(origin, destination, { force = false } = {}) {
  if (!origin || !destination) {
    throw new Error('Faltan las coordenadas de origen o destino');
  }

  const key = cacheKey(origin, destination);
  if (!force && cache.has(key)) {
    return { ...cache.get(key), cached: true };
  }

  if (!MAPS_API_KEY) {
    const error = new Error('Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY en el archivo .env');
    error.code = 'app/missing-key';
    throw error;
  }

  const body = {
    origin: toWaypoint(origin),
    destination: toWaypoint(destination),
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    computeAlternativeRoutes: false,
    languageCode: 'es',
    units: 'METRIC',
  };

  let response;
  try {
    response = await fetch(ROUTES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': MAPS_API_KEY,
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
        ...(Platform.OS === 'web' ? {} : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new Error('Sin conexión para calcular la ruta');
  }

  if (!response.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      detail = payload?.error?.message ?? '';
    } catch (parseError) {
      detail = '';
    }
    const error = new Error(
      `No se pudo calcular la ruta (${response.status})` + (detail ? `: ${detail}` : '')
    );
    error.code = 'app/route-failed';
    error.status = response.status;
    throw error;
  }

  const payload = await response.json();
  const route = payload?.routes?.[0];

  if (!route) {
    throw new Error('Google no devolvió ninguna ruta entre esos puntos');
  }

  const points = decodePolyline(route.polyline?.encodedPolyline);
  const distanceMeters = route.distanceMeters ?? 0;
  // La duración viene como "1234s".
  const durationSeconds = Number(String(route.duration ?? '0').replace('s', '')) || 0;

  const result = {
    points,
    distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
    durationMin: Math.max(1, Math.round(durationSeconds / 60)),
  };

  cache.set(key, result);
  return { ...result, cached: false };
}

// Permite reiniciar la caché al cambiar de viaje.
export function clearRouteCache() {
  cache.clear();
}
