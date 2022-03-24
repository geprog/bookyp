import { Model } from '@bookyp/core';
import { UseFind } from '@geprog/use-feathers';
import { computed } from 'vue';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';

export default function getMapObjects(): UseFind<Model.MapObject> {
  const { spaceId } = useCurrentSpace();
  const params = computed(() => {
    if (spaceId.value === null) {
      return undefined;
    }

    return { paginate: false, query: { space: spaceId.value } };
  });
  return useFind('mapObjects', params, {
    disableUnloadingEventHandlers: true,
  });
}
