import type { DbSpace } from '../../../utils/dbTypes';

/** Updates the settings of a space. Plan and validity can only be changed by super admins. */
export default defineEventHandler(async (event) => {
  const { user, space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const body = await readBody$(event, spaceUpdateSchema.merge(spaceSuperAdminUpdateSchema));
  const { spaces } = await useCollections();

  const { plan, activeUntil, ...update } = body;
  const $set: Partial<DbSpace> = { ...update };
  const $unset: Record<string, ''> = {};

  if (user.isSuperAdmin && (plan !== undefined || activeUntil !== undefined)) {
    if (plan !== undefined) {
      $set.plan = plan as DbSpace['plan'];
    }
    if (activeUntil === null) {
      $unset.activeUntil = '';
    }
    else if (activeUntil !== undefined) {
      $set.activeUntil = activeUntil;
    }
    // a super admin sets the plan manually, so a scheduled change is dropped and a running
    // subscription must stop charging the customer
    $unset.scheduledPlan = '';
    $unset.currentPeriodEnd = '';
    if (space.subscription) {
      await cancelSpaceSubscription(space);
      $unset.subscription = '';
      $unset.subscriptionOwner = '';
    }
  }

  const updated = await spaces.findOneAndUpdate(
    { _id: space._id },
    { $set, ...(Object.keys($unset).length ? { $unset } : {}) },
    { returnDocument: 'after' },
  );
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Space not found' });
  }
  await populateMembers([updated]);
  return serializeSpace(updated, user, 'admin');
});
