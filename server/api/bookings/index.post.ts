import type { DbBooking } from '../../utils/dbTypes';
import { z } from 'zod';

const bodySchema = z.object({
  bookable: idSchema,
  start: isoDateSchema,
  end: isoDateSchema,
  description: z.string().trim().max(2000).default(''),
});

/** Books a bookable for the current user. Depending on the space settings the booking becomes a request. */
export default defineEventHandler(async (event) => {
  const body = await readBody$(event, bodySchema);
  const { bookable, space, user } = await requireBookable(event, body.bookable, 'public');
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  if (bookable.deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Bookable not found' });
  }

  const request = isRequestBooking(space, user._id);
  assertValidRange(body.start, body.end);
  await assertNoOverlap(bookable._id.toString(), body.start, body.end);
  await assertCanAddBooking(space, body.start);

  const { bookings } = await useCollections();
  const booking: Omit<DbBooking, '_id'> = {
    start: body.start,
    end: body.end,
    description: body.description,
    bookable: bookable._id.toString(),
    space: space._id.toString(),
    bookedBy: user._id,
    ...(request ? { request: true } : {}),
  };
  const result = await bookings.insertOne(booking as DbBooking);
  const created = { ...booking, _id: result.insertedId } as DbBooking;

  // mails are sent in the background
  void sendAdminBookingNotification(publicAppUrl(event), space, user, bookable, created).catch(error => console.error('🔥 Could not send booking mail', error));

  setResponseStatus(event, 201);
  return serializeBooking(created, { _id: user._id, email: user.email, name: user.name });
});
