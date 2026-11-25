import { z } from 'zod';

const bodySchema = z.object({
  starredSpaces: z.array(idSchema).max(1000).optional(),
});

/** Updates the settings of the current user. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody$(event, bodySchema);
  const { users } = await useCollections();
  const updated = await users.findOneAndUpdate({ _id: toObjectId(user._id) }, { $set: body }, { returnDocument: 'after' });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }
  return toCurrentUser(updated);
});
