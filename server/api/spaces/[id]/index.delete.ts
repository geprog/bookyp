/** Soft deletes a space and cancels its subscription. */
export default defineEventHandler(async (event) => {
  const { space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { spaces } = await useCollections();

  if (space.subscription) {
    await cancelSpaceSubscription(space);
  }

  await spaces.updateOne({ _id: space._id }, { $set: { deleted: true }, $unset: { subscription: '', subscriptionOwner: '' } });
  return { ok: true };
});
