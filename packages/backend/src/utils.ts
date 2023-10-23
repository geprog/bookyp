import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';

type GetUserOptions = { requireUser: boolean };
/** Retrieves the user out of the given params. If requireUser option is set to true it will throw an error when no user is found. */
export function getUser(
  params: Params | undefined,
  options: Partial<GetUserOptions> & { requireUser: true },
): Model.User;
export function getUser(params: Params | undefined, options?: Partial<GetUserOptions>): Model.User | undefined;
export function getUser(params: Params | undefined, options: Partial<GetUserOptions> = {}): Model.User | undefined {
  const { requireUser } = options;
  const user = params?.user as Model.User | undefined;
  if (requireUser && !user) {
    throw new Error('No current active user');
  }
  return user;
}
