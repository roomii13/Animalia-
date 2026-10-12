export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN && process.env.MERCADOPAGO_WEBHOOK_SECRET);
}

export function getMercadoPagoCredentials() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!accessToken || !webhookSecret) {
    throw new Error('Faltan configurar las credenciales de Mercado Pago en el entorno del servidor.');
  }
  return { accessToken, webhookSecret };
}
