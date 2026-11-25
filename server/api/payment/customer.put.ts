import type { DbPaymentCustomer } from '../../utils/dbTypes';
import { billingName } from '#shared/utils/billing';

/** Creates or updates the billing details of the current user (and the customer at the payment provider). */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const { activePaymentMethod, ...body } = await readBody$(event, paymentCustomerSchema);
  const { paymentCustomers } = await useCollections();
  const provider = usePaymentProvider();

  const existing = await getPaymentCustomer(user._id);
  const providerData = { name: billingName(body), email: body.email || user.email, language: body.language, metadata: { userId: user._id } };

  let providerCustomerId = existing?.providerCustomerId;
  if (providerCustomerId) {
    await provider.updateCustomer(providerCustomerId, providerData);
  }
  else {
    providerCustomerId = await provider.createCustomer(providerData);
  }

  if (activePaymentMethod) {
    const mandates = await provider.listMandates(providerCustomerId);
    if (!mandates.some(mandate => mandate.id === activePaymentMethod)) {
      throw createError({ statusCode: 400, statusMessage: 'Unknown payment method' });
    }
  }

  const $set: Partial<DbPaymentCustomer> = { ...body, userId: user._id, providerCustomerId };
  const update = activePaymentMethod === null
    ? { $set, $unset: { activePaymentMethod: true as const } }
    : { $set: { ...$set, ...(activePaymentMethod ? { activePaymentMethod } : {}) } };

  const customer = await paymentCustomers.findOneAndUpdate({ userId: user._id }, update, { upsert: true, returnDocument: 'after' });
  // a newly selected payment method is used by the running subscriptions from now on
  if (activePaymentMethod && activePaymentMethod !== existing?.activePaymentMethod) {
    await switchPaymentMethod(user._id, activePaymentMethod);
  }
  // invoices of past payments that waited for complete billing details
  await issuePendingInvoices(user._id);
  return serializeCustomer(customer);
});
