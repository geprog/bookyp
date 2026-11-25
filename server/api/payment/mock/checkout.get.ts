import { z } from 'zod';

const querySchema = z.object({ payment: z.string().min(1) });

/** A tiny checkout page of the mocked payment provider. */
export default defineEventHandler(async (event) => {
  if (!isMockPaymentProvider()) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }
  const { payment: paymentId } = getQuery$(event, querySchema);
  const payment = await usePaymentProvider().getPayment(paymentId);
  const escape = (value: string) => value.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

  setHeader(event, 'Content-Type', 'text/html; charset=utf-8');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Mock payment</title>
    <style>
      body { font-family: system-ui, sans-serif; display: flex; justify-content: center; padding: 4rem 1rem; background: #f3f4f6; color: #111827; }
      main { background: #fff; border-radius: 0.75rem; padding: 2rem; max-width: 28rem; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
      h1 { margin-top: 0; font-size: 1.25rem; }
      .amount { font-size: 2rem; font-weight: 700; margin: 1rem 0; }
      form { display: flex; gap: 0.75rem; }
      button { flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: 0; font-size: 1rem; cursor: pointer; }
      .pay { background: #f59e0b; color: #fff; }
      .cancel { background: #e5e7eb; }
      p.hint { color: #6b7280; font-size: 0.875rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>Mocked payment provider</h1>
      <p>${escape(String((payment as { description?: string }).description ?? 'Payment'))}</p>
      <div class="amount">${payment.amount.toFixed(2)} ${escape(payment.currency)}</div>
      <p class="hint">Status: ${escape(payment.status)}. This page replaces the Mollie checkout during development.</p>
      <form method="post" action="/api/payment/mock/checkout">
        <input type="hidden" name="payment" value="${escape(payment.id)}" />
        <button class="pay" name="outcome" value="paid" type="submit" data-test="mock-pay">Pay</button>
        <button class="cancel" name="outcome" value="failed" type="submit" data-test="mock-cancel">Cancel</button>
      </form>
    </main>
  </body>
</html>`;
});
