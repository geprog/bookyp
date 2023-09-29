import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default function addIsUserAdmin(
  context: HookContext<Application, AdapterService<Model.Space>>,
): HookContext<Application, AdapterService<Model.Space>> {
  const { params } = context;

  const user = params.user as Model.User;

  const query = params.query as { $isUserAdmin?: boolean };

  if (context.result && query.$isUserAdmin && user) {
    const spaces = Array.isArray(context.result) ? context.result : [context.result as Model.Space];

    const adminSpaces = spaces.filter((space) => {
      if (space.members !== undefined) {
        return space.members
          .map((member) => (member.role === 'admin' ? member.userId : ''))
          .includes(user._id.toString());
      }
    });

    adminSpaces.forEach((space) => {
      space.isUserAdmin = true;
    });
  }

  return context;
}
