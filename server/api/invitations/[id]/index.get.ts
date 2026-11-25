export default defineEventHandler(async (event) => {
  const { invitation, user, isAdmin } = await requireInvitation(event, getRouterParam(event, 'id'));
  const [serialized] = await serializeInvitations([invitation], isAdmin ? undefined : user);
  return serialized;
});
