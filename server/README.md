# Backend de pagos — ViaMax

Servidor local que crea las preferencias de pago en Mercado Pago y escucha el
webhook para marcar el viaje como pagado en Firestore.

## 1. Requisitos

- Node.js 20+
- Cuenta de desarrollador de Mercado Pago
- Cuenta de servicio de Firebase (Admin SDK)

## 2. Instalar

```bash
cd server
npm install
```

## 3. Configurar

```bash
cp .env.example .env
```

Completa `.env`:

| Variable | Donde se obtiene |
|---|---|
| `MP_ACCESS_TOKEN` | Panel de Mercado Pago → Tus integraciones → app → Claves de aplicación → **modo Prueba** |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Console → Configuración → Cuentas de servicio → Generar clave privada |
| `PUBLIC_BASE_URL` | `http://localhost:3000` en emulador; URL de ngrok en teléfono físico |

Copia el JSON de Firebase como `server/firebase-service-account.json`.
Está en `.gitignore`: nunca se sube.

## 4. Levantar

```bash
npm start
```

Debe responder en `http://localhost:3000/health`:

```json
{ "ok": true, "mode": "sandbox" }
```

Si dice `"mode": "produccion"`, el token no empieza con `TEST-`.

## 5. Probar el checkout

Desde la app: viaje finalizado → **Pagar con tarjeta** → se abre el navegador
con el checkout de Mercado Pago.

Usa un **usuario comprador de prueba**:

1. Panel → Tus integraciones → Usuarios de prueba → Crear comprador
2. En el checkout, inicia sesión con ese usuario
3. Tarjeta de prueba: `5031 7557 3453 0604`, CVV `123`, vence `11/30`

Al aprobarse, el webhook marca el viaje como `paid` y la app sale sola de la
pantalla de pago.

## 6. En teléfono físico

`localhost` no funciona desde el celular. Necesitas exponer el backend:

```bash
npx ngrok http 3000
```

Copia la URL `https://xxxx.ngrok-free.app` en `PUBLIC_BASE_URL` y reinicia.

## 7. Seguridad

- El `access_token` vive solo aquí. La app nunca lo recibe.
- `firebase-service-account.json` y `.env` están en `.gitignore`.
- En producción iría en un servidor real, no en un PC.
