import { Model } from '@bookyp/core';
import { UseFind } from '@geprog/use-feathers';
import { computed } from 'vue';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';

let mapObjects: UseFind<Model.MapObject> | undefined = undefined;

export default function getMapObjects(): UseFind<Model.MapObject> {
  if (!mapObjects) {
    const { spaceId } = useCurrentSpace();
    mapObjects = useFind(
      'mapObjects',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
      {
        disableUnloadingEventHandlers: true,
      },
    );
  }
  return mapObjects;
}
