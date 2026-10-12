export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://animalia.rom-cel.workers.dev').replace(/\/$/, '');

export type ApiFailure = Error & { status: number; code?: string };

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw Object.assign(new Error('No se pudo conectar con Animalia. Revisá tu conexión e intentá de nuevo.'), { status: 0 }) as ApiFailure;
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const code = payload && typeof payload.error === 'string' ? payload.error : undefined;
    const messages: Record<string, string> = {
      INVALID_CREDENTIALS: 'El correo o la contraseña no son correctos.',
      EMAIL_ALREADY_REGISTERED: 'Ya existe una cuenta con ese correo.',
      INVALID_REGISTRATION: 'Revisá el nombre, el correo y la contraseña (mínimo 8 caracteres).',
      INVALID_POST: 'Revisá los datos del aviso e intentá de nuevo.',
      UNAUTHENTICATED: 'Iniciá sesión para continuar.',
      DATABASE_UNAVAILABLE: 'El servicio de datos no está disponible en este momento.',
      INVALID_CONTRIBUTION_AMOUNT: 'Ingresá un importe positivo con hasta dos decimales.',
      PAYMENT_PROVIDER_REJECTED: 'Mercado Pago no pudo iniciar ese aporte. Revisá el importe y probá otra vez.',
      PAYMENT_PROVIDER_UNAVAILABLE: 'Mercado Pago no está disponible en este momento.',
      PAYMENTS_UNAVAILABLE: 'Los aportes no están disponibles en este momento.',
      IDEMPOTENCY_KEY_REUSED: 'Ese intento ya quedó asociado a otro importe. Volvé a iniciar el aporte.',
    };
    throw Object.assign(new Error(messages[code ?? ''] ?? 'No se pudo completar la operación.'), { status: response.status, code }) as ApiFailure;
  }
  return payload as T;
}
