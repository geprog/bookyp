import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

export default function emailToLowerCase(
  context: HookContext<Application, AdapterService<Model.User>>,
): HookContext<Application, AdapterService<Model.User>> {
  if (context.data === undefined) {
    throw new Error('No data available');
  }

  if (Array.isArray(context.data)) {
    context.data.map((user) => ({ ...user, email: user.email?.toLowerCase() }));
  } else {
    context.data = { ...context.data, email: context.data.email?.toLowerCase() };
  }

  return context;
}
