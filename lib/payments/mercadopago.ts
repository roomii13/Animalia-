export interface MercadoPagoOrder {
  id?: string;
  external_reference?: string;
  type?: string;
  processing_mode?: string;
  status?: string;
  status_detail?: string;
  total_amount?: string;
  total_paid_amount?: string;
  currency?: string;
  checkout_url?: string;
  transactions?: {
    payments?: Array<{
      id?: string;
      status?: string;
      status_detail?: string;
    }>;
  };
}

export async function createMercadoPagoOrder(
  accessToken: string,
  idempotencyKey: string,
  order: Record<string, unknown>,
): Promise<Response> {
  return fetch('https://api.mercadopago.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(order),
  });
}

export async function getMercadoPagoOrder(accessToken: string, orderId: string): Promise<Response> {
  return fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });
}

export async function verifyMercadoPagoWebhookSignature(
  signature: string | null,
  requestId: string | null,
  dataId: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature || !requestId || !dataId) return false;
  const parts = new Map<string, string>();
  for (const part of signature.split(',')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    parts.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  const timestamp = parts.get('ts');
  const suppliedHash = parts.get('v1')?.toLowerCase();
  if (!timestamp || !suppliedHash || !/^[0-9a-f]{64}$/.test(suppliedHash)) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest)));
  const expectedHash = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('');
  let difference = expectedHash.length ^ suppliedHash.length;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= expectedHash.charCodeAt(index) ^ (suppliedHash.charCodeAt(index) || 0);
  }
  return difference === 0;
}
