import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import {
  createMercadoPagoOrder,
  getMercadoPagoOrder,
  verifyMercadoPagoWebhookSignature,
  type MercadoPagoOrder,
} from '../lib/payments/mercadopago';

interface Env {
  DATABASE_URL?: string;
  MERCADOPAGO_ACCESS_TOKEN?: string;
  MERCADOPAGO_WEBHOOK_SECRET?: string;
  PUBLIC_APP_URL?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  account_type: 'person' | 'rescue_organization';
  bio: string | null;
  locality: string | null;
}

const encoder = new TextEncoder();
type Sql = NeonQueryFunction<false, false>;
const KINDS = ['adoption', 'lost', 'rescue', 'help', 'event'] as const;
const TYPE_LABELS: Record<(typeof KINDS)[number], string> = {
  adoption: 'Adopción responsable',
  lost: 'Animal perdido',
  rescue: 'Rescate',
  help: 'Pedido de colaboración',
  event: 'Actividad comunitaria',
};
const EMOJIS: Record<(typeof KINDS)[number], string> = {
  adoption: '🐾', lost: '🐕', rescue: '🐈', help: '🤝', event: '📍',
};
const TINTS: Record<(typeof KINDS)[number], string> = {
  adoption: '#f7eadb', lost: '#f8e8e3', rescue: '#e9efe4', help: '#f7eadb', event: '#e9efe4',
};

function corsHeaders(request: Request): Headers {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Idempotency-Key',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  });
  const origin = request.headers.get('Origin');
  if (!origin || origin === 'https://animalia.rom-cel.workers.dev' || /^https?:\/\/localhost(?::\d+)?$/.test(origin)) {
    headers.set('Access-Control-Allow-Origin', origin ?? '*');
  }
  return headers;
}

function json(request: Request, body: unknown, status = 200): Response {
  const headers = corsHeaders(request);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(body), { status, headers });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (contentLength > 16_384) return null;
  try {
    const body: unknown = await request.json();
    return isRecord(body) ? body : null;
  } catch {
    return null;
  }
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value: string): Promise<string> {
  return base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}

async function passwordHash(password: string, salt = crypto.getRandomValues(new Uint8Array(16))): Promise<string> {
  const iterations = 310_000;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return `pbkdf2$${iterations}$${base64Url(salt)}$${base64Url(new Uint8Array(digest))}`;
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterationText, saltText, expectedText] = stored.split('$');
  const iterations = Number(iterationText);
  if (algorithm !== 'pbkdf2' || !Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000 || !saltText || !expectedText) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: decodeBase64Url(saltText), iterations }, key, 256));
  const expected = decodeBase64Url(expectedText);
  if (derived.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < derived.length; index += 1) difference |= derived[index] ^ expected[index];
  return difference === 0;
}

async function issueSession(sql: Sql, profileId: string): Promise<string> {
  const token = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  await sql`INSERT INTO public.auth_sessions (token_hash, profile_id, expires_at)
    VALUES (${tokenHash}, ${profileId}, now() + interval '30 days')`;
  return token;
}

async function currentProfile(request: Request, sql: Sql): Promise<ProfileRow | null> {
  const token = request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{40,60})$/)?.[1];
  if (!token) return null;
  const tokenHash = await sha256(token);
  const rows = await sql`SELECT p.id, p.username, p.display_name, p.account_type, p.bio, p.locality
    FROM public.auth_sessions s
    JOIN public.profiles p ON p.id = s.profile_id
    WHERE s.token_hash = ${tokenHash} AND s.expires_at > now()
    LIMIT 1`;
  return (rows[0] as ProfileRow | undefined) ?? null;
}

function profileResponse(profile: ProfileRow): Record<string, unknown> {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    accountType: profile.account_type,
    bio: profile.bio,
    locality: profile.locality,
  };
}

function postResponse(row: Record<string, unknown>): Record<string, unknown> {
  const kind = row.kind as (typeof KINDS)[number];
  return {
    id: row.id,
    kind,
    category: kind === 'adoption' ? 'Adopciones' : kind === 'lost' ? 'Perdidos' : kind === 'rescue' ? 'Rescates' : kind === 'event' ? 'Actividades' : 'Ayuda',
    type: TYPE_LABELS[kind],
    title: row.title,
    description: row.description,
    animal: [row.animal_name, row.animal_species].filter(Boolean).join(' · ') || 'Animal por describir',
    location: row.locality || 'Ubicación no informada',
    author: row.display_name,
    username: row.username,
    imageUrl: row.image_url,
    emoji: EMOJIS[kind],
    tint: TINTS[kind],
    createdAt: row.created_at,
  };
}

const POST_SELECT = `SELECT p.id, p.kind, p.title, p.description, p.animal_name, p.animal_species,
  p.locality, p.image_url, p.created_at, u.username, u.display_name
  FROM public.posts p JOIN public.profiles u ON u.id = p.author_id`;

function canonicalArsAmount(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(',', '.');
  const match = normalized.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return null;
  try {
    const whole = BigInt(match[1]);
    const fraction = BigInt((match[2] ?? '').padEnd(2, '0') || '0');
    if (whole * BigInt(100) + fraction <= BigInt(0)) return null;
  } catch {
    return null;
  }
  return `${BigInt(match[1]).toString()}.${(match[2] ?? '').padEnd(2, '0')}`;
}

function checkoutUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /(^|\.)mercadopago\.com(?:\.ar)?$/i.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function paymentStatus(order: MercadoPagoOrder, expectedAmount: string): 'pending' | 'approved' | 'cancelled' | 'refunded' | 'review' {
  const status = order.status?.toLowerCase();
  const paymentStatuses = order.transactions?.payments?.map((payment) => payment.status?.toLowerCase()) ?? [];
  if (status === 'refunded' || paymentStatuses.some((value) => value === 'refunded')) return 'refunded';
  if (status === 'cancelled' || status === 'canceled') return 'cancelled';
  if (status === 'processed') {
    return canonicalArsAmount(order.total_paid_amount ?? order.total_amount) === expectedAmount ? 'approved' : 'review';
  }
  if (status === 'charged_back' || status === 'in_mediation' || paymentStatuses.some((value) => value === 'charged_back' || value === 'in_mediation')) return 'review';
  return 'pending';
}

function contributionResponse(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
  };
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (!env.DATABASE_URL) return json(request, { error: 'DATABASE_UNAVAILABLE' }, 503);
  const sql: Sql = neon<false, false>(env.DATABASE_URL);
  const path = new URL(request.url).pathname;

  try {
    if (path === '/api/health' && request.method === 'GET') {
      await sql`SELECT 1`;
      return json(request, { ok: true, database: 'connected' });
    }

    if (path === '/api/payments/webhook' && request.method === 'POST') {
      if (!env.MERCADOPAGO_WEBHOOK_SECRET || !env.MERCADOPAGO_ACCESS_TOKEN) {
        return json(request, { error: 'PAYMENTS_UNAVAILABLE' }, 503);
      }
      const url = new URL(request.url);
      const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id');
      const requestId = request.headers.get('x-request-id');
      const signatureIsValid = await verifyMercadoPagoWebhookSignature(
        request.headers.get('x-signature'),
        requestId,
        dataId,
        env.MERCADOPAGO_WEBHOOK_SECRET,
      );
      if (!signatureIsValid) return json(request, { error: 'INVALID_WEBHOOK_SIGNATURE' }, 401);

      const notification = await readJson(request);
      const notificationType = url.searchParams.get('type') ?? notification?.type;
      if (notificationType && notificationType !== 'order') return json(request, { ok: true, ignored: true });
      if (!dataId || !/^[A-Za-z0-9_-]{6,80}$/.test(dataId)) return json(request, { error: 'INVALID_ORDER_ID' }, 400);

      const orderResponse = await getMercadoPagoOrder(env.MERCADOPAGO_ACCESS_TOKEN, dataId);
      const orderPayload: unknown = await orderResponse.json().catch(() => null);
      if (!orderResponse.ok || !isRecord(orderPayload)) {
        console.error('Mercado Pago order lookup failed', orderResponse.status);
        return json(request, { error: 'PAYMENT_PROVIDER_UNAVAILABLE' }, 502);
      }

      const order = orderPayload as unknown as MercadoPagoOrder;
      if (order.id !== dataId || !order.external_reference || !/^[0-9a-f-]{36}$/i.test(order.external_reference)) {
        return json(request, { ok: true, ignored: true });
      }
      const contributions = await sql`SELECT id, amount::text AS amount, currency, mp_order_id
        FROM public.payment_contributions WHERE id = ${order.external_reference}::uuid LIMIT 1`;
      const contribution = contributions[0] as Record<string, unknown> | undefined;
      if (!contribution) return json(request, { ok: true, ignored: true });

      const expectedAmount = canonicalArsAmount(contribution.amount);
      const orderAmount = canonicalArsAmount(order.total_amount);
      const paidAmount = canonicalArsAmount(order.total_paid_amount ?? order.total_amount);
      const currencyMatches = contribution.currency === 'ARS' && order.currency === 'ARS';
      const orderMatches = contribution.mp_order_id === null || contribution.mp_order_id === order.id;
      const detailsMatch = order.type === 'online' && order.processing_mode === 'manual'
        && expectedAmount !== null && expectedAmount === orderAmount;
      const nextStatus = !currencyMatches || !orderMatches || !detailsMatch
        ? 'review'
        : paymentStatus(order, expectedAmount);
      const safeStatus = nextStatus === 'approved' && paidAmount !== expectedAmount ? 'review' : nextStatus;

      const eventIdentifier = typeof notification?.id === 'string' || typeof notification?.id === 'number'
        ? String(notification.id)
        : requestId ?? `${dataId}:${request.headers.get('x-signature') ?? ''}`;
      const eventId = `order:${eventIdentifier}`.slice(0, 256);
      const paymentId = order.transactions?.payments?.find((payment) => typeof payment.id === 'string')?.id ?? null;
      await sql`
        WITH accepted_event AS (
          INSERT INTO public.payment_webhook_events (event_id, mp_order_id)
          VALUES (${eventId}, ${dataId})
          ON CONFLICT (event_id) DO NOTHING
          RETURNING event_id
        )
        UPDATE public.payment_contributions
        SET mp_order_id = COALESCE(mp_order_id, ${dataId}),
            mp_payment_id = COALESCE(${paymentId}, mp_payment_id),
            status = ${safeStatus},
            provider_status = ${order.status ?? 'unknown'},
            provider_status_detail = ${order.status_detail ?? null},
            approved_at = CASE WHEN ${safeStatus} = 'approved' THEN COALESCE(approved_at, now()) ELSE approved_at END,
            updated_at = now()
        WHERE id = ${contribution.id} AND (mp_order_id IS NULL OR mp_order_id = ${dataId})
          AND EXISTS (SELECT 1 FROM accepted_event)
      `;
      return json(request, { ok: true });
    }

    if (path === '/api/payments' && request.method === 'GET') {
      const profile = await currentProfile(request, sql);
      if (!profile) return json(request, { error: 'UNAUTHENTICATED' }, 401);
      const rows = await sql`SELECT id, amount::text AS amount, currency, status, created_at, approved_at
        FROM public.payment_contributions WHERE profile_id = ${profile.id}
        ORDER BY created_at DESC LIMIT 100`;
      return json(request, { contributions: rows.map((row) => contributionResponse(row as Record<string, unknown>)) });
    }

    if (path === '/api/payments/checkout' && request.method === 'POST') {
      if (!env.MERCADOPAGO_ACCESS_TOKEN) return json(request, { error: 'PAYMENTS_UNAVAILABLE' }, 503);
      const profile = await currentProfile(request, sql);
      if (!profile) return json(request, { error: 'UNAUTHENTICATED' }, 401);
      const body = await readJson(request);
      const amount = canonicalArsAmount(body?.amount);
      if (!amount) return json(request, { error: 'INVALID_CONTRIBUTION_AMOUNT' }, 400);

      const requestKey = request.headers.get('Idempotency-Key') ?? crypto.randomUUID();
      if (!/^[A-Za-z0-9._:-]{1,128}$/.test(requestKey)) {
        return json(request, { error: 'INVALID_IDEMPOTENCY_KEY' }, 400);
      }
      const intents = await sql`
        INSERT INTO public.payment_contributions (profile_id, idempotency_key, amount)
        VALUES (${profile.id}, ${requestKey}, ${amount})
        ON CONFLICT (profile_id, idempotency_key)
        DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
        RETURNING id, amount::text AS amount, currency, status, mp_order_id, checkout_url, created_at, approved_at
      `;
      const intent = intents[0] as Record<string, unknown>;
      if (canonicalArsAmount(intent.amount) !== amount) {
        return json(request, { error: 'IDEMPOTENCY_KEY_REUSED' }, 409);
      }
      if (intent.status !== 'pending') return json(request, { error: 'CONTRIBUTION_ALREADY_PROCESSED' }, 409);
      if (typeof intent.checkout_url === 'string') {
        return json(request, { contribution: contributionResponse(intent), checkoutUrl: intent.checkout_url });
      }

      const payerRows = await sql`SELECT email FROM public.account_credentials WHERE profile_id = ${profile.id} LIMIT 1`;
      const payerEmail = (payerRows[0] as { email?: string } | undefined)?.email;
      if (!payerEmail) return json(request, { error: 'ACCOUNT_EMAIL_UNAVAILABLE' }, 409);

      let appUrl: URL;
      try {
        appUrl = new URL(env.PUBLIC_APP_URL ?? 'https://animalia.rom-cel.workers.dev');
      } catch {
        return json(request, { error: 'PAYMENTS_UNAVAILABLE' }, 503);
      }
      if (appUrl.protocol !== 'https:') return json(request, { error: 'PAYMENTS_UNAVAILABLE' }, 503);

      const returnUrl = (result: string) => `${appUrl.origin}/payment-return.html?result=${result}`;
      const mpResponse = await createMercadoPagoOrder(env.MERCADOPAGO_ACCESS_TOKEN, String(intent.id), {
        type: 'online',
        processing_mode: 'manual',
        total_amount: amount,
        external_reference: String(intent.id),
        description: 'Aporte general a Animalia',
        payer: { email: payerEmail },
        items: [{
          external_code: 'ANIMALIA-CONTRIBUTION',
          title: 'Aporte general a Animalia',
          description: 'Aporte voluntario para sostener Animalia',
          quantity: 1,
          unit_price: amount,
        }],
        config: {
          statement_descriptor: 'ANIMALIA',
          online: {
            success_url: returnUrl('success'),
            failure_url: returnUrl('failure'),
            pending_url: returnUrl('pending'),
            auto_return: 'approved',
          },
        },
      });
      const providerResult: unknown = await mpResponse.json().catch(() => null);
      if (!mpResponse.ok || !isRecord(providerResult)) {
        console.error('Mercado Pago order creation failed', mpResponse.status);
        const status = mpResponse.status === 400 || mpResponse.status === 422 ? 422 : 502;
        const error = status === 422 ? 'PAYMENT_PROVIDER_REJECTED' : 'PAYMENT_PROVIDER_UNAVAILABLE';
        return json(request, { error }, status);
      }

      const createdOrder = providerResult as unknown as MercadoPagoOrder;
      const safeCheckoutUrl = checkoutUrl(createdOrder.checkout_url);
      if (!createdOrder.id || createdOrder.external_reference !== String(intent.id)
        || canonicalArsAmount(createdOrder.total_amount) !== amount || createdOrder.currency !== 'ARS' || !safeCheckoutUrl) {
        console.error('Mercado Pago order response requires review');
        await sql`UPDATE public.payment_contributions SET status = 'review', updated_at = now() WHERE id = ${intent.id}`;
        return json(request, { error: 'PAYMENT_ORDER_REQUIRES_REVIEW' }, 502);
      }

      const saved = await sql`UPDATE public.payment_contributions
        SET mp_order_id = ${createdOrder.id}, checkout_url = ${safeCheckoutUrl},
            provider_status = ${createdOrder.status ?? 'created'},
            provider_status_detail = ${createdOrder.status_detail ?? null}, updated_at = now()
        WHERE id = ${intent.id} AND status = 'pending'
        RETURNING id, amount::text AS amount, currency, status, created_at, approved_at`;
      const contribution = saved[0] as Record<string, unknown> | undefined;
      if (!contribution) return json(request, { error: 'CONTRIBUTION_ALREADY_PROCESSED' }, 409);
      return json(request, { contribution: contributionResponse(contribution), checkoutUrl: safeCheckoutUrl }, 201);
    }

    if (path === '/api/posts' && request.method === 'GET') {
      const requestedKind = new URL(request.url).searchParams.get('kind');
      if (requestedKind && !KINDS.includes(requestedKind as (typeof KINDS)[number])) {
        return json(request, { error: 'INVALID_KIND' }, 400);
      }
      const rows = requestedKind
        ? await sql`SELECT p.id, p.kind, p.title, p.description, p.animal_name, p.animal_species, p.locality, p.image_url, p.created_at, u.username, u.display_name
          FROM public.posts p JOIN public.profiles u ON u.id = p.author_id
          WHERE p.status = 'published' AND p.kind = ${requestedKind} ORDER BY p.created_at DESC LIMIT 50`
        : await sql`SELECT p.id, p.kind, p.title, p.description, p.animal_name, p.animal_species, p.locality, p.image_url, p.created_at, u.username, u.display_name
          FROM public.posts p JOIN public.profiles u ON u.id = p.author_id
          WHERE p.status = 'published' ORDER BY p.created_at DESC LIMIT 50`;
      const posts = rows.map((row) => postResponse(row));
      return json(request, { posts });
    }

    const postPath = path.match(/^\/api\/posts\/([0-9a-f-]{36})$/i);
    if (postPath && request.method === 'GET') {
      const rows = await sql`${sql.unsafe(POST_SELECT)} WHERE p.status = 'published' AND p.id = ${postPath[1]} LIMIT 1`;
      return rows[0] ? json(request, { post: postResponse(rows[0]) }) : json(request, { error: 'POST_NOT_FOUND' }, 404);
    }

    const savePath = path.match(/^\/api\/posts\/([0-9a-f-]{36})\/save$/i);
    if (savePath && ['GET', 'POST', 'DELETE'].includes(request.method)) {
      const profile = await currentProfile(request, sql);
      if (!profile) return json(request, { error: 'UNAUTHENTICATED' }, 401);
      const postId = savePath[1];
      if (request.method === 'GET') {
        const rows = await sql`SELECT 1 FROM public.saved_posts WHERE profile_id = ${profile.id} AND post_id = ${postId} LIMIT 1`;
        return json(request, { saved: rows.length > 0 });
      }
      if (request.method === 'POST') {
        await sql`INSERT INTO public.saved_posts (profile_id, post_id) SELECT ${profile.id}, id FROM public.posts WHERE id = ${postId} AND status = 'published' ON CONFLICT DO NOTHING`;
        return json(request, { saved: true });
      }
      await sql`DELETE FROM public.saved_posts WHERE profile_id = ${profile.id} AND post_id = ${postId}`;
      return json(request, { saved: false });
    }

    if (path === '/api/saved' && request.method === 'GET') {
      const profile = await currentProfile(request, sql);
      if (!profile) return json(request, { error: 'UNAUTHENTICATED' }, 401);
      const rows = await sql`SELECT p.id, p.kind, p.title, p.description, p.animal_name, p.animal_species, p.locality, p.image_url, p.created_at, u.username, u.display_name
        FROM public.saved_posts s JOIN public.posts p ON p.id = s.post_id JOIN public.profiles u ON u.id = p.author_id
        WHERE s.profile_id = ${profile.id} AND p.status = 'published' ORDER BY s.created_at DESC LIMIT 100`;
      return json(request, { posts: rows.map((row) => postResponse(row)) });
    }

    if (path === '/api/auth/register' && request.method === 'POST') {
      const body = await readJson(request);
      const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body?.password === 'string' ? body.password : '';
      const displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
      const accountType = body?.accountType === 'rescue_organization' ? 'rescue_organization' : 'person';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320 || password.length < 8 || password.length > 128 || !displayName || displayName.length > 80) {
        return json(request, { error: 'INVALID_REGISTRATION' }, 400);
      }
      const id = crypto.randomUUID();
      const suffix = base64Url(crypto.getRandomValues(new Uint8Array(6))).toLowerCase().replace(/[-_]/g, 'a');
      const baseName = displayName.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20) || 'animalia';
      const username = `${baseName}_${suffix}`.slice(0, 30);
      const storedPassword = await passwordHash(password);
      const rows = await sql`WITH new_profile AS (
          INSERT INTO public.profiles (id, username, display_name, account_type)
          VALUES (${id}, ${username}, ${displayName}, ${accountType})
          RETURNING id
        )
        INSERT INTO public.account_credentials (profile_id, email, password_hash)
        SELECT id, ${email}, ${storedPassword} FROM new_profile
        RETURNING profile_id`;
      if (!rows.length) return json(request, { error: 'REGISTRATION_FAILED' }, 400);
      const token = await issueSession(sql, id);
      const profile = { id, username, display_name: displayName, account_type: accountType, bio: null, locality: null } as ProfileRow;
      return json(request, { token, profile: profileResponse(profile) }, 201);
    }

    if (path === '/api/auth/login' && request.method === 'POST') {
      const body = await readJson(request);
      const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body?.password === 'string' ? body.password : '';
      const rows = await sql`SELECT c.profile_id, c.password_hash, p.username, p.display_name, p.account_type, p.bio, p.locality
        FROM public.account_credentials c
        JOIN public.profiles p ON p.id = c.profile_id
        WHERE c.email = ${email} LIMIT 1`;
      const row = rows[0] as (ProfileRow & { profile_id: string; password_hash: string }) | undefined;
      if (!row || !(await verifyPassword(password, row.password_hash))) return json(request, { error: 'INVALID_CREDENTIALS' }, 401);
      const token = await issueSession(sql, row.profile_id);
      const profile = { ...row, id: row.profile_id } as ProfileRow;
      return json(request, { token, profile: profileResponse(profile) });
    }

    if (path === '/api/auth/me' && request.method === 'GET') {
      const profile = await currentProfile(request, sql);
      return profile ? json(request, { profile: profileResponse(profile) }) : json(request, { error: 'UNAUTHENTICATED' }, 401);
    }

    const publicProfilePath = path.match(/^\/api\/profiles\/([a-z0-9_]{3,30})$/i);
    if (publicProfilePath && request.method === 'GET') {
      const rows = await sql`SELECT id, username, display_name, account_type, bio, locality
        FROM public.profiles WHERE username = ${publicProfilePath[1].toLowerCase()} LIMIT 1`;
      return rows[0] ? json(request, { profile: profileResponse(rows[0] as ProfileRow) }) : json(request, { error: 'PROFILE_NOT_FOUND' }, 404);
    }

    if (path === '/api/profiles/me' && request.method === 'PATCH') {
      const profile = await currentProfile(request, sql);
      if (!profile) return json(request, { error: 'UNAUTHENTICATED' }, 401);
      const body = await readJson(request);
      const displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : '';
      const locality = typeof body?.locality === 'string' ? body.locality.trim() : null;
      const bio = typeof body?.bio === 'string' ? body.bio.trim() : null;
      if (!displayName || displayName.length > 80 || (locality && locality.length > 120) || (bio && bio.length > 1000)) {
        return json(request, { error: 'INVALID_PROFILE' }, 400);
      }
      const rows = await sql`UPDATE public.profiles SET display_name = ${displayName}, locality = ${locality}, bio = ${bio}
        WHERE id = ${profile.id}
        RETURNING id, username, display_name, account_type, bio, locality`;
      return json(request, { profile: profileResponse(rows[0] as ProfileRow) });
    }

    if (path === '/api/auth/logout' && request.method === 'POST') {
      const token = request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{40,60})$/)?.[1];
      if (token) await sql`DELETE FROM public.auth_sessions WHERE token_hash = ${await sha256(token)}`;
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (path === '/api/posts' && request.method === 'POST') {
      const profile = await currentProfile(request, sql);
      if (!profile) return json(request, { error: 'UNAUTHENTICATED' }, 401);
      const body = await readJson(request);
      const kind = typeof body?.kind === 'string' ? body.kind : '';
      const title = typeof body?.title === 'string' ? body.title.trim() : '';
      const description = typeof body?.description === 'string' ? body.description.trim() : '';
      const locality = typeof body?.locality === 'string' ? body.locality.trim() : null;
      const animalName = typeof body?.animalName === 'string' ? body.animalName.trim() : null;
      const animalSpecies = typeof body?.animalSpecies === 'string' ? body.animalSpecies.trim() : null;
      if (!KINDS.includes(kind as (typeof KINDS)[number]) || !title || title.length > 120 || !description || description.length > 3000 || (locality && locality.length > 120) || (animalName && animalName.length > 100) || (animalSpecies && animalSpecies.length > 40)) {
        return json(request, { error: 'INVALID_POST' }, 400);
      }
      const rows = await sql`INSERT INTO public.posts (author_id, kind, title, description, locality, animal_name, animal_species)
        VALUES (${profile.id}, ${kind}, ${title}, ${description}, ${locality}, ${animalName}, ${animalSpecies})
        RETURNING id, kind, title, description, locality, animal_name, animal_species, created_at`;
      return json(request, { post: rows[0] }, 201);
    }

    return json(request, { error: 'NOT_FOUND' }, 404);
  } catch (error) {
    if (path === '/api/auth/register' && isRecord(error) && error.code === '23505') {
      return json(request, { error: 'EMAIL_ALREADY_REGISTERED' }, 409);
    }
    console.error('Animalia API request failed', error instanceof Error ? error.name : 'unknown');
    return json(request, { error: 'INTERNAL_ERROR' }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env);
    return env.ASSETS.fetch(request);
  },
};
