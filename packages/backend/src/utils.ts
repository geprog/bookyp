import { Model } from '@bookyp/core';
import { Paginated, Params } from '@feathersjs/feathers';

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

export function isPaginated<T>(result: T | Paginated<T>): result is Paginated<T> {
  return (result as Paginated<T>).total !== undefined;
}
