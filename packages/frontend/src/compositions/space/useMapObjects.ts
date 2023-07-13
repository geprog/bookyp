import { Model } from '@bookyp/core';
import { UseFind } from '@geprog/use-feathers';
import { computed, Ref } from 'vue';

import useFind from '~/compositions/useFind';

export default function getMapObjects(spaceId: Ref<string | undefined | null>): UseFind<Model.MapObject> {
  const params = computed(() => {
    if (spaceId.value === undefined || spaceId.value === null) {
      return undefined;
    }

    return { paginate: false, query: { space: spaceId.value } };
  });
  return useFind('mapObjects', params, {
    disableUnloadingEventHandlers: true,
  });
}
