import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext, Paginated } from '@feathersjs/feathers';

const SUPER_ADMINS = ['l.hass@geprog.com', 'a.bracke@geprog.com', 'hello@bookyp.de'];
const DEV_SUPER_ADMINS = ['alice@wonderland.org', 'her@bert.de'];

function isPaginated<T>(result: T | Paginated<T>): result is Paginated<T> {
  return (result as Paginated<T>).total !== undefined;
}

export function populateIsSuperAdmin(context: HookContext<Application, AdapterService<Model.User>>): void {
  const { result, method, type } = context;

  if (type !== 'after') {
    throw new Error("The 'populateIsSuperAdmin' hook should only be used as a 'after' hook.");
  }

  if (context.result === undefined || result === undefined || (method !== 'get' && method !== 'find')) {
    return;
  }

  let users;
  if (isPaginated(result)) {
    users = result.data;
  } else if (Array.isArray(result)) {
    users = result;
  } else {
    users = [result];
  }

  users = users.map((user) => ({
    ...user,
    isSuperAdmin:
      SUPER_ADMINS.includes(user.email) ||
      (process.env.NODE_ENV === 'development' && DEV_SUPER_ADMINS.includes(user.email)),
  }));

  if (isPaginated(context.result)) {
    context.result.data = users;
  } else if (Array.isArray(result)) {
    context.result = users;
  } else {
    context.result = users[0];
  }
}
