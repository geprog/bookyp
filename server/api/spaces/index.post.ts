import type { DbSpace } from '../../utils/dbTypes';

/** Creates a space with the current user as its admin. */
export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody$(event, spaceCreateSchema.merge(spaceSuperAdminUpdateSchema));
  const { spaces } = await useCollections();

  const { plan, activeUntil, ...data } = body;
  // like v1 the space is only public when the client says so (the create form does, the sample space does not)
  const space: Omit<DbSpace, '_id'> = {
    floorPlan: [],
    bookingsAndRequests: 'bookings',
    ...data,
    members: [{ role: 'admin', userId: user._id }],
    plan: user.isSuperAdmin && plan ? (plan as DbSpace['plan']) : 'free',
    activeUntil: user.isSuperAdmin && activeUntil ? activeUntil : undefined,
  };

  const result = await spaces.insertOne(space as DbSpace);
  const created = { ...space, _id: result.insertedId } as DbSpace;
  await populateMembers([created]);
  setResponseStatus(event, 201);
  return serializeSpace(created, user, 'admin');
});
