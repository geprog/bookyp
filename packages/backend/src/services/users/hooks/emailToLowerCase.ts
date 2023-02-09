import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default function emailToLowerCase(
  context: HookContext<Application, AdapterService<Model.User>>,
): HookContext<Application, AdapterService<Model.User>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }

  let users = Array.isArray(context.data) ? context.data : [context.data];
  users = users.map((user) => ({ ...user, email: user.email?.toLowerCase() }));
  context.data = Array.isArray(context.data) ? users : users[0];

  return context;
}
