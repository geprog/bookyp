/** A single bookable. Deleted bookables are returned as well (flagged with `deleted`) so old bookings can still show them. */
export default defineEventHandler(async (event) => {
  const { bookable } = await requireBookable(event, getRouterParam(event, 'id'), 'public');
  return serialize(bookable);
});
