/**
 * Webhook called by Mollie whenever the status of a payment changes.
 * Mollie sends the payment id form encoded and retries on non-2xx responses.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ id?: string } | undefined>(event);
  const paymentId = body?.id;
  if (!paymentId || typeof paymentId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Expected a payment id' });
  }
  await handlePaymentUpdate(paymentId, publicAppUrl(event));
  return { ok: true };
});
