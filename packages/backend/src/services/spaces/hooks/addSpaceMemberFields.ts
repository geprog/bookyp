import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default async function addSpaceMemberFields(
  context: HookContext<Application, AdapterService<Model.Space>>,
): Promise<HookContext<Application, AdapterService<Model.Space>>> {
  if (context.result) {
    const spaces = Array.isArray(context.result) ? context.result : [context.result as Model.Space];
    const userIds = spaces.reduce<Set<string>>(
      (set, space) => new Set([...set, ...space.members.map((member) => member.userId)]),
      new Set(),
    );
    const users = (await context.app.service('users').find({ query: { _id: { $in: [...userIds] } } })) as Model.User[];
    const userMap = users.reduce<Map<string, Model.User>>((map, user) => {
      map.set(user._id.toString(), user);
      return map;
    }, new Map());

    spaces.forEach((space) => {
      space.members.map((member) => {
        const user = userMap.get(member.userId);
        member.name = user?.name;
        member.email = user?.email;
      });
    });
  }
  return context;
}
