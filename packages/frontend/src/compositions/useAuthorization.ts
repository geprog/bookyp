import { Model, resolveAction } from '@bookyp/core';
import { Ability, subject } from '@casl/ability';
import { computed, Ref, ref } from 'vue';

import { useCurrentSpace } from './space/useCurrentSpace';

export const ability = ref(new Ability([], { resolveAction }));

export const isSpaceAdmin = (space?: Ref<Model.Space | undefined>): Ref<boolean> => {
  const spaceToCheck = space || useCurrentSpace().currentSpace;

  return computed(() => {
    if (spaceToCheck.value === undefined) {
      return false;
    }
    return ability.value.can('update', subject('spaces', spaceToCheck.value));
  });
};
