import { z } from 'zod';

const bodySchema = z.object({
  /** the path of this app to send the user to after the checkout (a full url could redirect anywhere) */
  redirectPath: z.string().regex(/^\/(?!\/)/, 'redirectPath must be a path of this app'),
});

/** Starts the checkout to add a new payment method. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const { redirectPath } = await readBody$(event, bodySchema);
  // the user returns to the origin the app was opened at
  const redirectUrl = `${requestOrigin(event)}${redirectPath}`;
  const customer = await getPaymentCustomer(user._id);
  if (!customer?.providerCustomerId) {
    apiError(400, 'payment_customer_required', 'Please add your billing details first');
  }
  return createMandateCheckout(user, customer as typeof customer & { providerCustomerId: string }, redirectUrl, publicAppUrl(event));
});
