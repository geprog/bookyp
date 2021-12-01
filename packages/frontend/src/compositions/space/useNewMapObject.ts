import { Model } from '@bookyp/core';
import { computed, ComputedRef, Ref } from 'vue';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

type UseNewMapObject = {
  addMapObject: () => void;
  resetNewMapObjectId: () => void;
  isNewMapObjectPresent: ComputedRef<boolean>;
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

  const isNewMapObjectPresent = computed(() => {
    const newMapObjects = mapObjects.value.filter(isNewMapObject);
    return newMapObjects.length > 0;
  });

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
      paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
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
    isNewMapObjectPresent,
  };
}
