/** Withdraws an invitation. */
export default defineEventHandler(async (event) => {
  const { invitation, isAdmin } = await requireInvitation(event, getRouterParam(event, 'id'));
  if (!isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  const { invitations } = await useCollections();
  await invitations.deleteOne({ _id: invitation._id });
  return { ok: true };
});
