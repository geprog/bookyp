import { Application, Model } from '@bookyp/core';
import { HookContext } from '@feathersjs/feathers';
import casl, { authorize } from 'feathers-casl';

import { defineAbilitiesFor } from '~/services/authentication/authentication.abilities';

export const feathersCasl = casl();

export const feathersCaslAllowlist = ['$nor', '$and'];

/**
 * Use this hook for services that are authorized with dynamic rules (that depend on a database call).
 *
 * For more info see https://github.com/fratzinger/feathers-casl/issues/33#issuecomment-995987497
 */
export const authorizeWithFreshAbility = async (context: HookContext): Promise<HookContext> => {
  delete context.params.ability;
  return authorize({
    adapter: 'feathers-mongoose',
    ability: async (c: HookContext<Application>) => defineAbilitiesFor(c.params.user as Model.User, c.app),
  })(context);
};
