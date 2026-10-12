# Animalia

Animalia reúne una app nativa para iOS y Android en `mobile/` y una página web informativa en `public/about.html`.

## Estado

- La app Expo SDK 54 conecta cuentas, avisos y aportes generales a Neon.
- Los aportes usan Mercado Pago Checkout Orders, importe libre, confirmación por webhook firmado e historial por cuenta.
- Mensajería, publicación de fotos y distribución en tiendas siguen en desarrollo.
- El sitio web es solo informativo; no contiene la experiencia de la app.
- No se generaron binarios de distribución. Desde Windows, EAS Build puede compilar iOS en la nube; Android puede compilarse con EAS o localmente.

## App móvil

La app usa Expo SDK 54 y requiere Node.js 20.19 o superior. Su soporte mínimo es Android 7 e iOS 15.1. Desde la carpeta `mobile/`:

```sh
npm install
npx expo start
```

Para preparar una compilación con EAS, instalar `eas-cli`, iniciar sesión y usar los perfiles de `mobile/eas.json`.

## Configuración prevista

1. Copiá `.env.example` a `.env.local` y completá las credenciales del servidor.
2. Creá una base Neon y ejecutá `npm run db:migrate` para aplicar las migraciones registradas, incluida la tabla de aportes.
3. Antes de habilitar registros, definí el proveedor de autenticación y vinculá sus identidades con `profiles`.
4. Mercado Pago usa `MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_WEBHOOK_SECRET` solo en el Worker. Configurá en Tus integraciones, en modo productivo, el evento `Order (Mercado Pago)` con `https://animalia.rom-cel.workers.dev/api/payments/webhook`.

`DATABASE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` y `AUTH_SECRET` son secretos de servidor. No se incluyen credenciales reales en el repositorio ni se deben incluir en la app móvil.

Para aplicar migraciones locales registradas, ejecutá `npm run db:migrate` desde la raíz. El comando registra versiones aplicadas y se detiene si encuentra tablas previas sin registrar.
