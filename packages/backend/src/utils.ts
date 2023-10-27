import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';

export function getUser(params: Params | undefined): Model.User | undefined {
  const user = params?.user as Model.User | undefined;
  return user;
}

export function requireUser(params: Params | undefined): Model.User {
  const user = getUser(params);

  if (!user) {
    throw new Error('No current active user');
  }

  return user;
}
