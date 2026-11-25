import type { DbBookable } from '../../../utils/dbTypes';

export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const body = await readBody$(event, bookableSchema);
  await assertCanAddBookable(space);

  const { bookables } = await useCollections();
  const bookable = { ...body, space: space._id.toString() } as DbBookable;
  const result = await bookables.insertOne(bookable);
  setResponseStatus(event, 201);
  return serialize({ ...bookable, _id: result.insertedId });
});
