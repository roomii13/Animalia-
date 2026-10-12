import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const envFile = resolve(root, '.env.local');
const source = readFileSync(envFile, 'utf8').replace(/^\uFEFF/, '');
const entry = source.split(/\r?\n/).find((line) => /^\s*DATABASE_URL\s*=/.test(line));
if (!entry) {
  console.error('No se encontró DATABASE_URL en .env.local.');
  process.exit(1);
}

const value = entry.replace(/^\s*DATABASE_URL\s*=\s*/, '').replace(/^(['"])(.*)\1\s*$/, '$2').trim();
if (!value.startsWith('postgres://') && !value.startsWith('postgresql://')) {
  console.error('DATABASE_URL no tiene un formato de PostgreSQL válido.');
  process.exit(1);
}

const wrangler = resolve(root, 'node_modules/wrangler/bin/wrangler.js');
const child = spawn(process.execPath, [wrangler, 'secret', 'put', 'DATABASE_URL'], {
  cwd: root,
  stdio: ['pipe', 'inherit', 'inherit'],
});
child.stdin.end(`${value}\n`);
child.on('error', (error) => {
  console.error(`No se pudo ejecutar Wrangler: ${error.message}`);
  process.exitCode = 1;
});
child.on('close', (code) => {
  if (code !== 0) process.exitCode = code ?? 1;
});
