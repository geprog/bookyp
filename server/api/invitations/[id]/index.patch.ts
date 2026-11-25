import { z } from 'zod';

const bodySchema = z.object({ role: z.enum(['admin', 'user']) });

/** Changes the role of an invitation. */
export default defineEventHandler(async (event) => {
  const { invitation, isAdmin } = await requireInvitation(event, getRouterParam(event, 'id'));
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  const body = await readBody$(event, bodySchema);
  const { invitations } = await useCollections();
  const updated = await invitations.findOneAndUpdate({ _id: invitation._id }, { $set: body }, { returnDocument: 'after' });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Invitation not found' });
  }
  const [serialized] = await serializeInvitations([updated]);
  return serialized;
});
