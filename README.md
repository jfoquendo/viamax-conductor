# ViaMax Conductor

Aplicación móvil del conductor para ViaMax (Expo SDK 58 + React Native).
Incluye registro en 3 pasos, autenticación, aprobación de cuenta, mapa en
tiempo real y GPS.

> **Todo el proyecto funciona con el plan gratuito de Firebase (Spark).**
> No requiere Cloud Functions ni tarjeta de crédito.

## Requisitos

- Node.js 20+
- Expo Go o un development build
- Cuenta de Firebase (plan Spark, gratuito)

## Instalación

```bash
npm install
cp .env.example .env   # completa las variables
npx expo start
```

Sin variables de Firebase la app arranca en **modo demo local**: registro y
login funcionan contra el almacenamiento del dispositivo. Es útil para probar
la UI, pero no cumple R2.

## Configuración de Firebase (gratis)

La configuración se describe a continuación.

Resumen:

1. Crear el proyecto y la app Android `com.viamax.conductor`.
2. Habilitar **Authentication > Correo/contraseña**.
3. Crear **Firestore** en modo producción.
4. Copiar las claves web a `.env` (`EXPO_PUBLIC_FIREBASE_*`).
5. `firebase login`, `firebase use --add` y desplegar **solo reglas**:
   ```bash
   firebase deploy --only firestore:rules
   ```
6. Reiniciar Expo: `npx expo start -c`.

No hay que activar Blaze ni desplegar Functions.

## Flujo de cuenta

```
Login -> (sin perfil) Registro 3 pasos -> pending_approval
      -> Pantalla de revisión -> approved -> Drawer principal
```

- El estado vive en `drivers/{uid}` de Firestore.
- Las reglas permiten al conductor **leer y escribir solo su documento** y
  **no le permiten cambiar** el campo `status`.
- La aprobación se hace en la consola: Firestore > `drivers` > `{uid}` >
  `status: "approved"`. La app lo detecta en tiempo real y entra al mapa.

## Estructura

```
src/
  components/     formularios, layout
  config/         tarifas
  context/        AuthContext, RegistrationContext
  hooks/          useDriverLocation
  navigation/     Auth, Tabs, Drawer
  screens/        auth, registration, home, earnings, history, profile
  services/       firebase, driverService, storage
  theme/          tokens y estilo del mapa
  utils/          fechas, validadores, tarifa
functions/        opcional: requiere plan Blaze, NO se usa
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run android` | Abrir en Android |
| `npm run ios` | Abrir en iOS |

## Límites del plan gratuito

- Firestore: 1 GiB, 50.000 lecturas/día, 20.000 escrituras/día.
- Authentication por correo/contraseña: sin costo.
- Para un proyecto de clase y las pruebas del flujo, la cuota es suficiente.

## Uso de IA

El proyecto se desarrolló con **asesoría de IA**: la IA explicó, comparó alternativas y ayudó a diagnosticar errores; las decisiones y la implementación se revisaron y adaptaron manualmente.

El detalle completo está en [docs/AI_LOG.md](docs/AI_LOG.md), con 21 entradas que registran objetivo, consulta, resumen de la orientación recibida, qué se aplicó o descartó, archivos afectados y aprendizaje.

En el código, los archivos con decisiones de diseño no triviales llevan un comentario al inicio que indica la entrada correspondiente:

```javascript
// Calculo de tarifa con asesoria de IA (docs/AI_LOG.md #3).
```

Están marcados:

| Área | Archivos |
|---|---|
| Seguridad y permisos | `firestore.rules` |
| Ciclo de vida de la cuenta | `src/context/AuthContext.js` |
| Solicitudes de viaje | `src/hooks/useTripRequests.js` |
| Rutas y mapa | `src/services/routeService.js`, `src/components/maps/TripMapCard.js` |
| Cobro del viaje | `src/screens/trip/TripSummaryScreen.js` |
| Tarifas y validaciones | `src/utils/calculateFare.js`, `src/utils/validators.js` |
| Backend de pagos | `server/index.js` |
| Notificaciones push | `server/notifications.js` |

## Servicios externos

| Servicio | Uso | Costo |
|---|---|---|
| Firebase (Spark) | Autenticación, Firestore | Gratuito |
| Google Maps Platform | Mapa, rutas y tráfico | Cuota gratuita mensual |
| Mercado Pago | Cobro con tarjeta (modo prueba) | Sin costo en sandbox |
| Cloudinary | Fotos de perfil y documentos | Plan gratuito |

## Backend de pagos

El cobro con tarjeta requiere un servidor local que guarda el token de la pasarela:

```bash
cd server
npm install
npm start
```

Consulta `server/README.md` para las credenciales y el flujo completo.

## Seguridad

- `.env` no se versiona; `.env.example` solo tiene placeholders.
- Los secretos de pago viven en el backend, nunca en la app.
- La contraseña nunca se guarda en el perfil ni en Firestore.
- Las reglas de Firestore bloquean el cambio de estado desde el cliente.
