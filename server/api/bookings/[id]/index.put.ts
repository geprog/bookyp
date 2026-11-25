import dayjs from 'dayjs';
import { z } from 'zod';

const bodySchema = z.object({
  start: isoDateSchema,
  end: isoDateSchema,
  description: z.string().trim().max(2000).default(''),
});

/** Changes the time or description of a booking. */
export default defineEventHandler(async (event) => {
  const { booking, space, user, access } = await requireBookingDetails(event, getRouterParam(event, 'id'));
  if (space.deleted || access === 'none') {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' });
  }
  if (booking.deleted) {
    throw createError({ statusCode: 410, statusMessage: 'Booking was deleted' });
  }
  // the one who booked may only change the booking while still allowed to book it the same way
  // (e.g. a removed member must not move a booking that would be a request now)
  if (access !== 'admin' && isRequestBooking(space, user._id) && !booking.request) {
    apiError(403, 'bookings_not_allowed', 'Bookings are only allowed as requests for this space');
  }
  const body = await readBody$(event, bodySchema);
  assertValidRange(body.start, body.end);
  await assertNoOverlap(booking.bookable, body.start, body.end, booking._id.toString());
  // moving into another month uses up a booking of that month
  if (!dayjs(body.start).isSame(booking.start, 'month')) {
    await assertCanAddBooking(space, body.start, booking._id.toString());
  }

  const { bookings } = await useCollections();
  const updated = await bookings.findOneAndUpdate({ _id: booking._id }, { $set: body }, { returnDocument: 'after' });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' });
  }

  if (booking.bookedBy !== user._id) {
    // an admin changed the booking of someone else (time or description), inform the one who booked like v1
    void loadBookingContext(booking)
      .then(({ bookable, bookedBy }) => bookedBy && sendUserBookingNotification(publicAppUrl(event), space, bookedBy, bookable, booking, updated, false))
      .catch(error => console.error('🔥 Could not send booking changed mail', error));
  }

  const users = await loadPublicUsers([updated.bookedBy]);
  return serializeBooking(updated, users.get(updated.bookedBy));
});
