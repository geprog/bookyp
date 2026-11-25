/**
 * The details of a booking (deleted ones included). The one who booked it and the admins of the space get everything,
 * other users of the space only the time slot like in v1 (e.g. after tapping a foreign booking in the calendar).
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const { bookings } = await useCollections();
  const booking = await bookings.findOne({ _id: toObjectId(getRouterParam(event, 'id')) });
  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' });
  }
  const space = await loadSpace(booking.space, { includeDeleted: true });
  const access = getSpaceAccess(space, user);
  // like v1 the own bookings stay readable everywhere (e.g. after losing access to the space),
  // other bookings only within an accessible space that is not deleted
  if (!canSeeBookingDetails(booking, user, access) && (access === 'none' || space.deleted)) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' });
  }
  const [serialized] = await serializeBookingsFor([booking], user, access);
  return serialized;
});
