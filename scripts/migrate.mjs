import { readdirSync, readFileSync } from 'node:fs';
import { extname, parse, resolve } from 'node:path';
import pg from 'pg';

function loadLocalEnvironment() {
  for (const file of ['.env.local', '.env']) {
    let source;
    try {
      source = readFileSync(resolve(file), 'utf8').replace(/^\uFEFF/, '');
    } catch {
      continue;
    }

    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z\d_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[1] in process.env) continue;
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}

loadLocalEnvironment();

if (!process.env.DATABASE_URL) {
  console.error('No se aplicaron migraciones: falta DATABASE_URL en .env.local o en el entorno.');
  process.exit(1);
}

const directory = resolve('database/migrations');
const migrations = readdirSync(directory)
  .filter((file) => extname(file) === '.sql')
  .sort((left, right) => left.localeCompare(right, 'en'));
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  application_name: 'animalia-migrations',
  connectionTimeoutMillis: 12_000,
});

let transactionOpen = false;

try {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of migrations) {
    const migrationId = parse(file).name;
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query('SELECT pg_advisory_xact_lock(541054, 1)');
    const previous = await client.query(
      'SELECT version FROM public.schema_migrations WHERE version = $1',
      [migrationId],
    );

    if (previous.rowCount) {
      await client.query('COMMIT');
      transactionOpen = false;
      console.log(`La migración ${migrationId} ya estaba aplicada.`);
      continue;
    }

    if (migrationId === '0001_initial') {
      const existing = await client.query(
        `SELECT tablename FROM pg_catalog.pg_tables
         WHERE schemaname = 'public' AND tablename = ANY($1::text[]) ORDER BY tablename`,
        [['profiles', 'posts', 'follows', 'saved_posts', 'conversations', 'conversation_members', 'messages', 'reports']],
      );
      if (existing.rowCount) {
        throw new Error(`La migración inicial se detuvo: ya existen tablas sin registrar (${existing.rows.map((row) => row.tablename).join(', ')}).`);
      }
    }

    await client.query(readFileSync(resolve(directory, file), 'utf8'));
    await client.query('INSERT INTO public.schema_migrations (version) VALUES ($1)', [migrationId]);
    await client.query('COMMIT');
    transactionOpen = false;
    console.log(`Migración ${migrationId} aplicada.`);
  }
} catch (error) {
  if (transactionOpen) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original migration error.
    }
  }
  console.error(`Falló la secuencia de migraciones: ${error instanceof Error ? error.message : 'error desconocido'}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
