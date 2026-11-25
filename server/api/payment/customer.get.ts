/** The billing details of the current user. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const customer = await getPaymentCustomer(user._id);
  return serializeCustomer(customer);
});
