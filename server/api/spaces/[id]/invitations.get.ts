/** The pending invitations of a space. */
export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { invitations } = await useCollections();
  const docs = await invitations.find({ spaceId: space._id.toString() }).sort({ _id: 1 }).toArray();
  return serializeInvitations(docs);
});
