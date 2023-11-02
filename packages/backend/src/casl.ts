import { Application } from '@bookyp/core';
import { HookContext } from '@feathersjs/feathers';
import casl, { authorize } from 'feathers-casl';

import { defineAbilitiesFor } from '~/services/authentication/authentication.abilities';
import { getUser } from '~/utils';

export const feathersCasl = casl();

export const feathersCaslAllowlist = ['$nor', '$and', '$not'];

/**
 * Use this hook for services that are authorized with dynamic rules (that depend on a database call).
 *
 * For more info see https://github.com/fratzinger/feathers-casl/issues/33#issuecomment-995987497
 */
export const authorizeWithFreshAbility =
  (adapter: 'feathers-mongoose' | 'feathers-memory' = 'feathers-mongoose') =>
  async (context: HookContext): Promise<HookContext> => {
    context.params.ability = async (c: HookContext<Application>) => defineAbilitiesFor(getUser(c.params), c.app);
    return authorize({
      adapter,
    })(context);
  };
