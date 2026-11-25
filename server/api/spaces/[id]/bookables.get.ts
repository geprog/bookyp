import { z } from 'zod';

const querySchema = z.object({
  includeDeleted: z.enum(['true', 'false']).optional(),
});

/** The bookables of a space. */
export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAccess(event, getRouterParam(event, 'id'), 'public');
  const { includeDeleted } = getQuery$(event, querySchema);
  const { bookables } = await useCollections();
  const filter: Record<string, unknown> = { space: space._id.toString() };
  if (includeDeleted !== 'true') {
    filter.deleted = { $ne: true };
  }
  const docs = await bookables.find(filter).sort({ _id: 1 }).toArray();
  return serializeAll(docs);
});
