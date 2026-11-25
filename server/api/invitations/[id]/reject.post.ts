import { isDomainInvitation } from '#shared/types/models';

/** Rejects an invitation. Domain invitations are only hidden for the user, direct invitations are removed. */
export default defineEventHandler(async (event) => {
  const { invitation, user } = await requireInvitation(event, getRouterParam(event, 'id'));
  if (!isInvitee(invitation, user)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  const { invitations } = await useCollections();
  if (isDomainInvitation(invitation)) {
    await invitations.updateOne({ _id: invitation._id }, { $addToSet: { rejectedBy: user._id } });
  }
  else {
    await invitations.deleteOne({ _id: invitation._id });
  }
  return { ok: true };
});
