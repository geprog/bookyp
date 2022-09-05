import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default async function addSpaceName(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): Promise<HookContext<Application, AdapterService<Model.Invitation>>> {
  if (context.result) {
    if (Array.isArray(context.result)) {
      const spaces = (await context.app
        .service('spaces')
        .find({ query: { _id: { $in: context.result.map((invitation) => invitation.spaceId) } } })) as Model.Space[];
      context.result.forEach((invitation) => {
        invitation.spaceName = spaces.find((space) => space._id.toString() === invitation.spaceId)?.name || '';
      });
    } else {
      const invitation = context.result as Model.Invitation;
      const space = await context.app.service('spaces').get(invitation.spaceId);
      invitation.spaceName = space.name;
    }
  }
  return context;
}
