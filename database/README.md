# Base de datos

Animalia usa Neon Postgres desde el Worker de Cloudflare. La app móvil nunca recibe la cadena de conexión: envía solicitudes a `/api/*` y el Worker accede a Neon con el secreto `DATABASE_URL`.

## Migraciones

Las migraciones SQL están en `database/migrations`. Ejecutá `npm run db:migrate` para aplicar las pendientes; cada migración se registra en `schema_migrations` y se ejecuta dentro de una transacción.

## Variables

- `DATABASE_URL`: secreto del Worker de Cloudflare para el entorno de producción.
- `EXPO_PUBLIC_API_URL`: URL pública del Worker para la app móvil; por defecto usa `https://animalia.rom-cel.workers.dev`.

No agregues `DATABASE_URL` a variables `EXPO_PUBLIC_*` ni la incluyas en el bundle móvil.

## API conectada

- `GET /api/health`: comprueba la conexión con Neon.
- `GET /api/posts`: lista avisos publicados.
- `POST /api/auth/register` y `POST /api/auth/login`: crean cuentas y sesiones.
- `GET /api/auth/me` y `POST /api/auth/logout`: consultan y cierran la sesión.
- `POST /api/posts`: crea un aviso para la cuenta autenticada.
