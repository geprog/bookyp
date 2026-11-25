import { isDomainInvitation } from '#shared/types/models';

/** Accepts an invitation: the user becomes a member of the space. Domain invitations stay open for other users. */
export default defineEventHandler(async (event) => {
  const { invitation, user } = await requireInvitation(event, getRouterParam(event, 'id'));
  if (!isInvitee(invitation, user)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  const { invitations, spaces } = await useCollections();
  const space = await loadSpace(invitation.spaceId);

  if (!space.members.some(member => member.userId === user._id)) {
    // a direct invitation already holds its place, a domain invitation lets any number of users join
    if (isDomainInvitation(invitation)) {
      await assertCanAddMember(space, invitation);
    }
    await spaces.updateOne({ _id: space._id }, { $push: { members: { role: invitation.role, userId: user._id } } });
  }
  if (!isDomainInvitation(invitation)) {
    await invitations.deleteOne({ _id: invitation._id });
  }
  return { spaceId: invitation.spaceId };
});
