export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta configurar DATABASE_URL para conectar Neon Postgres.');
  return url;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
