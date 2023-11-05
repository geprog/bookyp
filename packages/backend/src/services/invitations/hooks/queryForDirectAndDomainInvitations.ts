import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { getUser } from '~/utils';

export default async function queryForDirectAndDomainInvitations(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): Promise<HookContext<Application, AdapterService<Model.Invitation>>> {
  const query = context.params.query || {};
  if (query.spaceId) {
    // request for invitations of specific space so we don't adjust anything
    return context;
  }
  const user = getUser(context.params);

  if (user) {
    const userSpaces = (await context.app.service('spaces').find({
      query: { members: { $elemMatch: { userId: user._id } } },
    })) as Model.Space[];
    const directInvitations = (await context.app.service('invitations').find({
      query: { email: user.email },
    })) as Model.Invitation[];

    context.params.query = {
      ...query,
      $or: [
        // direct invitations
        { email: user.email },
        {
          // domain invitations
          email: `@${user.email.split('@')[1]}`,
          spaceId: {
            $nin: [...userSpaces.map((space) => space._id), ...directInvitations.map(({ spaceId }) => spaceId)],
          }, // only get domain invitations of spaces where user is not already member or has direct invitation
          rejectedBy: { $ne: user._id }, // only get domain invitations that the user has not yet rejected
        },
      ],
    };
  }
  return context;
}
