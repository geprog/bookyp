/** Removes the image of the space. */
export default defineEventHandler(async (event) => {
  const { user, space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { spaces } = await useCollections();
  const updated = await spaces.findOneAndUpdate({ _id: space._id }, { $unset: { imageKey: '' } }, { returnDocument: 'after' });
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Space not found' });
  }
  await removeFiles(`${space._id.toString()}/`).catch(error => console.error('🔥 Could not clean up space images', error));
  await populateMembers([updated]);
  return serializeSpace(updated, user, 'admin');
});
