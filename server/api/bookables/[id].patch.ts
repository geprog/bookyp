export default defineEventHandler(async (event) => {
  const { bookable } = await requireBookable(event, getRouterParam(event, 'id'), 'admin');
  const body = await readBody$(event, bookableSchema.partial());
  const { bookables } = await useCollections();
  const updated = await bookables.findOneAndUpdate({ _id: bookable._id }, { $set: body }, { returnDocument: 'after' });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Bookable not found' });
  }
  return serialize(updated);
});
