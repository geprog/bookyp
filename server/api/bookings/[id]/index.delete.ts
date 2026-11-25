/**
 * Soft deletes a booking. When an admin deletes the booking (or rejects the request)
 * of someone else, the one who booked gets informed by mail.
 */
export default defineEventHandler(async (event) => {
  const { booking, space, user } = await requireBookingDetails(event, getRouterParam(event, 'id'));
  if (booking.deleted) {
    return { ok: true };
  }
  const { bookings } = await useCollections();
  await bookings.updateOne({ _id: booking._id }, { $set: { deleted: true } });

  if (booking.bookedBy !== user._id) {
    void loadBookingContext(booking)
      .then(({ bookable, bookedBy }) => {
        if (!bookedBy) {
          return;
        }
        return booking.request
          ? sendRequestReplyNotification(publicAppUrl(event), space, bookedBy, bookable, booking, false)
          : sendUserBookingNotification(publicAppUrl(event), space, bookedBy, bookable, booking, booking, true);
      })
      .catch(error => console.error('🔥 Could not send booking deleted mail', error));
  }

  return { ok: true };
});
