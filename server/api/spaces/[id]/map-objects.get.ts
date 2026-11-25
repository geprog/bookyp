export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAccess(event, getRouterParam(event, 'id'), 'public');
  const { mapObjects } = await useCollections();
  const docs = await mapObjects.find({ space: space._id.toString() }).toArray();
  return serializeAll(docs);
});
