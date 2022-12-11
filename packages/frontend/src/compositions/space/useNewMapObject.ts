import { Model } from '@bookyp/core';
import { Ref, ref } from 'vue';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

export type MapObjectType = {
  name: string;
  viewBox: string;
  paths: string[];
};

export const mapObjectTypes: MapObjectType[] = [
  {
    name: 'couch',
    viewBox: '-20 0 80 80', // TODO: calculate viewBox from paths on upload
    paths: [
      'M5.60744 79.7345C3.25936 79.7345 1.35559 77.8319 1.35559 75.4853V5.90494C1.35559 3.55833 3.25936 1.65576 5.60744 1.65576H39.0908C41.4389 1.65576 43.3426 3.55833 43.3426 5.90494V75.4853C43.3426 77.8319 41.4389 79.7345 39.0908 79.7345H5.60744Z',
      'M38.0278 6.96729H1.35559V74.423H38.0278V6.96729Z',
      'M38.0279 6.96729H29.5242V40.4296H38.0279V6.96729Z',
      'M38.0279 40.4296H29.5242V74.423H38.0279V40.4296Z',
    ],
  },
  {
    name: 'table',
    viewBox: '-15 -5 150 150',
    paths: [
      'M32 0h80v140h-80v-140z', // for the table
      'M0 42h32v56h-32v-56z', // for the chair
    ],
  },
];

const selectedMapObjectType = ref<MapObjectType>(mapObjectTypes[1]);

type UseNewMapObject = {
  addMapObject: () => Promise<void>;
  resetNewMapObjectId: () => void;
  selectedMapObjectType: Ref<MapObjectType>;
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
  selectMapObject: (id: string | null) => Promise<void>,
): UseNewMapObject {
  const { spaceId } = useCurrentSpace();

  async function addMapObject() {
    if (!spaceId.value) {
      throw new Error('Unexpected: A space must be selected');
    }

    newMapObjectId--;
    const newMapObject = {
      _id: String(newMapObjectId),
      xPos: 0,
      yPos: 0,
      rotation: 0,
      paths: selectedMapObjectType.value.paths,
      type: selectedMapObjectType.value.name,
      space: spaceId.value,
    };
    mapObjects.value.push(newMapObject);
    await selectMapObject(newMapObject._id);
  }

  function resetNewMapObjectId() {
    newMapObjectId = 0;
  }

  return {
    addMapObject,
    resetNewMapObjectId,
    selectedMapObjectType,
  };
}
