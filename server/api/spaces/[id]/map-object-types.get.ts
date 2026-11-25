/** The custom map object types uploaded for a space. */
export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { mapObjectTypes } = await useCollections();
  const docs = await mapObjectTypes.find({ spaceId: space._id.toString() }).toArray();
  return serializeAll(docs);
});
