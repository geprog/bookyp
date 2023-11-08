import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { requireUser } from '~/utils';

export default async function acceptInvitation(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): Promise<HookContext<Application, AdapterService<Model.Invitation>>> {
  const { accept } = (context.params.query || {}) as { accept?: boolean };
  if (context.id && accept !== undefined) {
    const invitation = await context.app.service('invitations').get(context.id);
    const user = requireUser(context.params);
    if (accept) {
      const space = await context.app.service('spaces').get(invitation.spaceId);
      space.members.push({
        role: invitation.role,
        userId: user._id,
      });
      await context.app.service('spaces').update(invitation.spaceId, space);
    } else {
      invitation.rejectedBy.push(user._id);
      await context.app.service('invitations').update(invitation._id, invitation);
    }

    if (Model.Invitation.isDomainInvitation(invitation)) {
      // if it is a domain invitation keep invitation open
      context.result = invitation;
    }
  }
  return context;
}
