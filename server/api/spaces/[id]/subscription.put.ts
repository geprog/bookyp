import type { SpacePlan } from '#shared/types/models';
import { z } from 'zod';
import { spacePlanNames } from '#shared/utils/plans';

const bodySchema = z.object({ plan: z.enum(spacePlanNames as [string, ...string[]]) });

/**
 * Changes the plan of the space. A paid plan without a running paid period returns the `checkoutUrl`
 * of the payment of the first month, the user returns to the subscription page afterwards.
 */
export default defineEventHandler(async (event) => {
  const { user, space } = await requireSpaceAdmin(event, getRouterParam(event, 'id'));
  const { plan } = await readBody$(event, bodySchema);
  // the user returns to the origin the app was opened at
  const redirectUrl = `${requestOrigin(event)}/space/${space._id.toString()}/settings/subscription?checkout=${plan}`;
  return changeSpacePlan(space, plan as SpacePlan, user, publicAppUrl(event), redirectUrl);
});
