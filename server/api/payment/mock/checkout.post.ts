import { z } from 'zod';
import { completeMockCheckout } from '../../../utils/payments/mock';

const bodySchema = z.object({ payment: z.string().min(1), outcome: z.enum(['paid', 'failed']) });

/** Completes a mocked checkout and sends the user back to the app. */
export default defineEventHandler(async (event) => {
  if (!isMockPaymentProvider()) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' });
  }
  const { payment, outcome } = await readBody$(event, bodySchema);
  const redirectUrl = await completeMockCheckout(payment, outcome);
  return sendRedirect(event, redirectUrl);
});
