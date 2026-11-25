/**
 * The open invitations of the current user: direct invitations to the e-mail address
 * and domain invitations (`@example.com`) of spaces the user is not a member of yet and has not rejected.
 */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const { invitations, spaces } = await useCollections();

  const memberSpaces = await spaces.find({ members: { $elemMatch: { userId: user._id } } }, { projection: { _id: 1 } }).toArray();
  const direct = await invitations.find({ email: user.email }).toArray();
  const domain = await invitations
    .find({
      email: emailDomain(user.email),
      spaceId: { $nin: [...memberSpaces.map(s => s._id.toString()), ...direct.map(i => i.spaceId)] },
      rejectedBy: { $ne: user._id },
    })
    .toArray();

  const deletedSpaceIds = new Set(
    (await spaces.find({ deleted: true }, { projection: { _id: 1 } }).toArray()).map(s => s._id.toString()),
  );
  return serializeInvitations([...direct, ...domain].filter(invitation => !deletedSpaceIds.has(invitation.spaceId)), user);
});
