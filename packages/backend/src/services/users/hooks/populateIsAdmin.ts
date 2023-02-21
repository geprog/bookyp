import { Application, Model } from '@bookyp/core';
import { AdapterService } from '@feathersjs/adapter-commons';
import { HookContext } from '@feathersjs/feathers';

const ADMINS = ['l.hass@geprog.com'];
const DEV_ADMINS = ['alice@wonderland.org', 'her@bert.de'];

export function populateIsAdmin(context: HookContext<Application, AdapterService<Model.User>>): void {
  const { data, method } = context;

  if (data === undefined || (method !== 'get' && method !== 'find')) {
    return;
  }

  let users = Array.isArray(data) ? data : [data];
  users = users.map((user) => ({
    ...user,
    isAdmin:
      ADMINS.includes(user.email as string) ||
      (process.env.NODE_ENV === 'development' && DEV_ADMINS.includes(user.email as string)),
  }));
  context.data = Array.isArray(context.data) ? users : users[0];
}
