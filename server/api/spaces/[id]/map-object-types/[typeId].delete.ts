export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { mapObjectTypes } = await useCollections();
  const result = await mapObjectTypes.deleteOne({ _id: toObjectId(getRouterParam(event, 'typeId')), spaceId: space._id.toString() });
  if (result.deletedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Map object type not found' });
  }
  return { ok: true };
});
