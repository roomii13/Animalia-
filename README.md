# Animalia

Animalia reúne una app nativa para iOS y Android en `mobile/` y una página web informativa en `public/about.html`.

## Estado

- La app Expo incluye navegación y pantallas nativas de muestra para la comunidad.
- El acceso, publicaciones, mensajería, administración y Mercado Pago aún no están conectados.
- Las publicaciones visibles en el feed son datos de muestra.
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
2. Creá una base Neon y ejecutá `database/migrations/0001_initial.sql` desde su SQL Editor.
3. Antes de habilitar registros, definí el proveedor de autenticación y vinculá sus identidades con `profiles`.
4. Mercado Pago requiere credenciales privadas en servidor y verificación de firma/estado antes de confirmar cualquier pago.

`DATABASE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` y `AUTH_SECRET` son secretos de servidor. No se incluyen credenciales reales en el repositorio ni se deben incluir en la app móvil.

Para aplicar migraciones locales registradas, ejecutá `npm run db:migrate` desde la raíz. El comando registra versiones aplicadas y se detiene si encuentra tablas previas sin registrar.
