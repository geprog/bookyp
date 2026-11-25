export default defineEventHandler(async (event) => {
  const { user, space, access } = await requireSpaceAccess(event, getRouterParam(event, 'id'), 'public');
  if (access === 'admin') {
    await populateMembers([space]);
  }
  return serializeSpace(space, user, access);
});
