/** The pdf of an issued invoice, rendered by the payment provider. */
export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { invoices } = await useCollections();
  const invoice = await invoices.findOne({ _id: toObjectId(getRouterParam(event, 'invoiceId')), spaceId: space._id.toString() });
  if (!invoice?.providerInvoiceId) {
    throw createError({ statusCode: 404, statusMessage: 'Invoice not found' });
  }
  const pdf = await usePaymentProvider().getSalesInvoicePdf(invoice.providerInvoiceId);
  setHeader(event, 'Content-Type', 'application/pdf');
  setHeader(event, 'Content-Disposition', `inline; filename="invoice-${invoice.number ?? invoice._id.toString()}.pdf"`);
  return pdf;
});
