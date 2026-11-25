import { z } from 'zod';

const querySchema = z.object({
  space: idSchema.optional(),
  bookable: idSchema.optional(),
  /** `me` for the bookings of the current user */
  bookedBy: z.literal('me').optional(),
  /** only bookings overlapping the given range */
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  /** only bookings that are (or were) requests */
  requests: z.enum(['true', 'false']).optional(),
  includeDeleted: z.enum(['true', 'false']).optional(),
});

/**
 * Lists bookings. Either the bookings of the current user (`bookedBy=me`) or the
 * bookings of a space / bookable. Details of foreign bookings are only visible to admins.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery$(event, querySchema);
  const { bookings, bookables } = await useCollections();

  const filter: Record<string, unknown> = {};
  if (query.from) {
    filter.end = { $gt: query.from };
  }
  if (query.to) {
    filter.start = { $lt: query.to };
  }
  if (query.requests === 'true') {
    filter.request = { $exists: true };
  }

  if (query.bookedBy === 'me') {
    const user = await requireUser(event);
    filter.bookedBy = user._id;
    if (query.includeDeleted !== 'true') {
      filter.deleted = { $ne: true };
    }
    if (query.space) {
      filter.space = query.space;
    }
    const docs = await bookings.find(filter).sort({ start: 1 }).toArray();
    return docs.map(booking => serializeBooking(booking));
  }

  let spaceId = query.space;
  if (query.bookable) {
    const bookable = await bookables.findOne({ _id: toObjectId(query.bookable) });
    if (!bookable) {
      throw createError({ statusCode: 404, statusMessage: 'Bookable not found' });
    }
    spaceId = bookable.space;
    filter.bookable = query.bookable;
  }
  if (!spaceId) {
    throw createError({ statusCode: 400, statusMessage: 'Please filter by space, bookable or bookedBy=me' });
  }

  const { user, space, access } = await requireSpaceAccess(event, spaceId, 'public');
  filter.space = space._id.toString();
  if (query.requests === 'true' && access !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  // deleted bookings of others are only visible to admins
  if (query.includeDeleted !== 'true' || access !== 'admin') {
    filter.deleted = { $ne: true };
  }

  const docs = await bookings.find(filter).sort({ start: 1 }).toArray();
  return serializeBookingsFor(docs, user, access);
});
