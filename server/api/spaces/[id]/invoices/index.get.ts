import type { Invoice } from '#shared/types/models';

export default defineEventHandler(async (event): Promise<Invoice[]> => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { invoices } = await useCollections();
  const docs = await invoices.find({ spaceId: space._id.toString() }).sort({ date: -1 }).toArray();
  return docs.map(doc => ({
    _id: doc._id.toString(),
    number: doc.number,
    date: doc.date.toISOString(),
    status: doc.status,
    waitsForBillingDetails: doc.status === 'pending' && doc.error === 'billing_details_incomplete',
    spaceId: doc.spaceId,
    currency: doc.currency,
    totalAmount: doc.totalAmount,
  }));
});
