import { Model, resolveAction } from '@bookyp/core';
import { Ability, subject } from '@casl/ability';
import { ref } from 'vue';

import { reAuthenticate } from '~/compositions/useAuthentication';

export const ability = ref(new Ability([], { resolveAction }));

export const isSpaceAdmin = async (space: Model.Space): Promise<boolean> => {
  // update ability
  await reAuthenticate();

  return ability.value.can('update', subject('spaces', space));
};
