/** Revokes a payment method. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const methodId = getRouterParam(event, 'methodId');
  if (!methodId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' });
  }
  const customer = await getPaymentCustomer(user._id);
  if (!customer?.providerCustomerId) {
    throw createError({ statusCode: 404, statusMessage: 'Payment method not found' });
  }
  await usePaymentProvider().revokeMandate(customer.providerCustomerId, methodId);
  if (customer.activePaymentMethod === methodId) {
    const { paymentCustomers } = await useCollections();
    await paymentCustomers.updateOne({ _id: customer._id }, { $unset: { activePaymentMethod: '' } });
  }
  return { ok: true };
});
