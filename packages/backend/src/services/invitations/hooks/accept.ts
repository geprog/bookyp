import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { updateSpaceSubscription } from '~/lib/paymentsApi';
import { requireUser } from '~/utils';

export default async function accept(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): Promise<HookContext<Application, AdapterService<Model.Invitation>>> {
  if (context.id && context.params.query?.accept === true) {
    const invitation = await context.app.service('invitations').get(context.id);
    const space = await context.app.service('spaces').get(invitation.spaceId);
    const user = requireUser(context.params);
    space.members.push({
      role: invitation.role,
      userId: user._id,
    });
    if (space.subscription) {
      await updateSpaceSubscription(space);
    }
    await context.app.service('spaces').update(invitation.spaceId, space);
  }
  return context;
}
