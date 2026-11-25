import dayjs from 'dayjs';
import { z } from 'zod';

const querySchema = z.object({
  /** only spaces with a bookable that is free in the given range */
  freeFrom: isoDateSchema.optional(),
  freeTo: isoDateSchema.optional(),
  /** only spaces the current user administrates */
  admin: z.enum(['true', 'false']).optional(),
  /** add the number of bookings of the current user in the last 30 days */
  withFrequency: z.enum(['true', 'false']).optional(),
});

/** All spaces the current user is allowed to see (public spaces and the spaces the user is a member of). */
export default defineEventHandler(async (event) => {
  const user = await getUser(event);
  const query = getQuery$(event, querySchema);
  const { spaces, bookings, bookables } = await useCollections();

  const filter: Record<string, unknown> = visibleSpacesFilter(user);
  if (query.admin === 'true') {
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    if (!user.isSuperAdmin) {
      filter.members = { $elemMatch: { userId: user._id, role: 'admin' } };
    }
  }

  if (query.freeFrom && query.freeTo) {
    const occupied = await bookings.distinct('bookable', {
      deleted: { $ne: true },
      start: { $lt: query.freeTo },
      end: { $gt: query.freeFrom },
    });
    const spaceIdsWithFreeBookable = await bookables.distinct('space', {
      deleted: { $ne: true },
      _id: { $nin: occupied.filter(isValidId).map(id => toObjectId(id)) },
    });
    filter._id = { $in: spaceIdsWithFreeBookable.filter(isValidId).map(id => toObjectId(id)) };
  }

  const docs = await spaces.find(filter).sort({ name: 1 }).toArray();
  await populateMembers(docs.filter(doc => getSpaceAccess(doc, user) === 'admin'));

  const frequencies = new Map<string, number>();
  if (query.withFrequency === 'true' && user) {
    const recent = await bookings
      .aggregate<{ _id: string; count: number }>([
        { $match: { bookedBy: user._id, deleted: { $ne: true }, start: { $gte: dayjs().subtract(30, 'days').toDate() } } },
        { $group: { _id: '$space', count: { $sum: 1 } } },
      ])
      .toArray();
    for (const entry of recent) {
      frequencies.set(entry._id, entry.count);
    }
  }

  return docs.map((doc) => {
    const serialized = serializeSpace(doc, user, getSpaceAccess(doc, user));
    const frequency = frequencies.get(serialized._id);
    return frequency ? { ...serialized, frequency } : serialized;
  });
});
