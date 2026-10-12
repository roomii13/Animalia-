import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const envPath = resolve(root, '.env.local');
const source = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
const requiredSecrets = ['MERCADOPAGO_ACCESS_TOKEN', 'MERCADOPAGO_WEBHOOK_SECRET'];

function readEnvValue(name) {
  const line = source.split(/\r?\n/).find((entry) => new RegExp(`^\\s*${name}\\s*=`).test(entry));
  if (!line) throw new Error(`Falta ${name} en .env.local.`);
  const value = line.replace(new RegExp(`^\\s*${name}\\s*=\\s*`), '').replace(/^(['"])(.*)\1\s*$/, '$2').trim();
  if (!value) throw new Error(`${name} está vacío en .env.local.`);
  return value;
}

const wrangler = resolve(root, 'node_modules/wrangler/bin/wrangler.js');
const secrets = Object.fromEntries(requiredSecrets.map((name) => [name, readEnvValue(name)]));
const child = spawn(process.execPath, [wrangler, 'secret', 'bulk'], {
  cwd: root,
  stdio: ['pipe', 'inherit', 'inherit'],
});
child.stdin.end(JSON.stringify(secrets));
const exitCode = await new Promise((resolveExit, reject) => {
  child.on('error', reject);
  child.on('close', resolveExit);
});
if (exitCode !== 0) process.exit(exitCode ?? 1);

console.log('Secretos de Mercado Pago cargados en el Worker Animalia.');
