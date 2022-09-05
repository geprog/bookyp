import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default async function checkUserAlreadyInSpace(
  context: HookContext<Application, AdapterService<Model.Invitation>>,
): Promise<HookContext<Application, AdapterService<Model.Invitation>>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }
  if (Array.isArray(context.data)) {
    throw new Error('Only one invitation can be created at a time');
  }
  const { spaceId, role, email } = context.data;
  if (spaceId === undefined) {
    throw new Error('spaceId should be defined');
  }
  if (role === undefined) {
    throw new Error('Role should be defined');
  }
  if (email === undefined) {
    throw new Error('Email should be defined');
  }
  const space = await context.app.service('spaces').get(spaceId);
  const users = (await context.app.service('users').find({ query: { email } })) as Model.User[];
  if (users.length > 0) {
    const userId = users[0]._id.toString();
    if (space.members.find((member) => member.userId === userId) !== undefined) {
      throw new Error('User already in space');
    }
  }
  return context;
}
