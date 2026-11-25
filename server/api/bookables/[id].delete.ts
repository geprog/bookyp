/** Soft deletes a bookable. Existing bookings keep referencing it. */
export default defineEventHandler(async (event) => {
  const { bookable } = await requireBookable(event, getRouterParam(event, 'id'), 'admin');
  const { bookables, mapObjects } = await useCollections();
  await bookables.updateOne({ _id: bookable._id }, { $set: { deleted: true } });
  // map objects pointing at the bookable lose their link
  await mapObjects.updateMany({ 'space': bookable.space, 'link.type': 'bookable', 'link.bookable': bookable._id.toString() }, { $unset: { link: '' } });
  return { ok: true };
});
