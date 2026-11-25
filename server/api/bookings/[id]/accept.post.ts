/** Accepts a booking request, turning it into a regular booking. */
export default defineEventHandler(async (event) => {
  const { booking, space, access } = await requireBookingDetails(event, getRouterParam(event, 'id'));
  if (access !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  if (booking.deleted) {
    throw createError({ statusCode: 410, statusMessage: 'Booking was deleted' });
  }
  const { bookings } = await useCollections();
  const updated = await bookings.findOneAndUpdate({ _id: booking._id }, { $set: { request: false } }, { returnDocument: 'after' });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' });
  }

  if (booking.request) {
    void loadBookingContext(booking)
      .then(({ bookable, bookedBy }) => bookedBy && sendRequestReplyNotification(publicAppUrl(event), space, bookedBy, bookable, updated, true))
      .catch(error => console.error('🔥 Could not send request accepted mail', error));
  }

  const users = await loadPublicUsers([updated.bookedBy]);
  return serializeBooking(updated, users.get(updated.bookedBy));
});
