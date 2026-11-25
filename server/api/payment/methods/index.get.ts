import type { PaymentMethod } from '#shared/types/models';

/** The payment methods (mandates) of the current user. */
export default defineEventHandler(async (event): Promise<PaymentMethod[]> => {
  const user = await requireUser(event);
  const customer = await getPaymentCustomer(user._id);
  if (!customer?.providerCustomerId) {
    return [];
  }
  const mandates = await usePaymentProvider().listMandates(customer.providerCustomerId);
  return mandates
    .filter(mandate => mandate.status !== 'invalid')
    .map(mandate => ({ _id: mandate.id, type: mandate.method, name: mandate.name, status: mandate.status }));
});
