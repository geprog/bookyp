import { z } from 'zod';

const bodySchema = z.object({ role: z.enum(['admin', 'user']) });

/** Changes the role of a member. */
export default defineEventHandler(async (event) => {
  const { user, space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const userId = getRouterParam(event, 'userId');
  const { role } = await readBody$(event, bodySchema);
  const { spaces } = await useCollections();

  if (!space.members.some(member => member.userId === userId)) {
    throw createError({ statusCode: 404, statusMessage: 'Member not found' });
  }

  const updated = await spaces.findOneAndUpdate(
    { '_id': space._id, 'members.userId': userId },
    { $set: { 'members.$.role': role } },
    { returnDocument: 'after' },
  );
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Space not found' });
  }
  await populateMembers([updated]);
  return serializeSpace(updated, user, 'admin');
});
