import { Model } from '@bookyp/core';
import { Ref } from 'vue';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

type UseNewMapObject = {
  addMapObject: () => Promise<void>;
  resetNewMapObjectId: () => void;
};

// set id of unsaved added mapObject to a negative number to distinguish it from saved mapObjects
let newMapObjectId = 0;

export function isNewMapObject(mapObject: Model.MapObject): boolean {
  if (Number(mapObject._id) < 0) {
    return true;
  }
  return false;
}

export default function useNewMapObject(
  mapObjects: Ref<Model.MapObject[]>,
  selectMapObject: (mapObject: Model.MapObject) => Promise<void>,
): UseNewMapObject {
  const { spaceId } = useCurrentSpace();

  async function addMapObject() {
    if (!spaceId.value) {
      throw new Error('Unexpected: A space must be selected');
    }

    newMapObjectId--;
    mapObjects.value.push({
      _id: String(newMapObjectId),
      xPos: 0,
      yPos: 0,
      rotation: 0,
      paths: [
        'M32 0h80v140h-80v-140z', // for the table
        'M0 42h32v56h-32v-56z', // for the chair
      ],
      type: Model.MapObjectTypes.table,
      space: spaceId.value,
    });
    await selectMapObject(mapObjects.value[mapObjects.value.length - 1]);
  }

  function resetNewMapObjectId() {
    newMapObjectId = 0;
  }

  return {
    addMapObject,
    resetNewMapObjectId,
  };
}
