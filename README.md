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

Sigue la guía paso a paso en [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md).

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

## Seguridad

- `.env` no se versiona; `.env.example` solo tiene placeholders.
- Los secretos de pago viven en el backend, nunca en la app.
- La contraseña nunca se guarda en el perfil ni en Firestore.
- Las reglas de Firestore bloquean el cambio de estado desde el cliente.
