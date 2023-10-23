import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

import { getUser } from '~/utils';

export default function addIsUserMember(
  context: HookContext<Application, AdapterService<Model.Space>>,
): HookContext<Application, AdapterService<Model.Space>> {
  const { params } = context;

  const user = getUser(params);

  const query = params.query as { $isUserMember?: boolean };

  if (context.result && query.$isUserMember && user) {
    const spaces = Array.isArray(context.result) ? context.result : [context.result as Model.Space];

    const memberSpaces = spaces.filter((space) => {
      if (space.members !== undefined) {
        return space.members.map((member) => member.userId).includes(user._id.toString());
      }
    });

    memberSpaces.forEach((space) => {
      space.isUserMember = true;
    });
  }

  return context;
}
