import { Model } from '@bookyp/core';
import { Ref, ref } from 'vue';

import { spaceId } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

type UseNewMapObject = {
  newMapObject: Ref<null | Omit<Model.MapObject, '_id'>>;
  addMapObject: () => void;
  saveNewMapObject: () => Promise<void>;
  positionNewMapObject: (svgP: { x: number; y: number }) => void;
};

export default function useNewMapObject(): UseNewMapObject {
  const feathers = useFeathers();
  const newMapObject = ref<null | Omit<Model.MapObject, '_id'>>(null);

  function addMapObject() {
    newMapObject.value = {
      xPos: 0,
      yPos: 0,
      rotation: 0,
      paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],

      type: Model.MapObjectTypes.table,
      space: spaceId.value,
    };
  }

  async function saveNewMapObject(): Promise<void> {
    if (newMapObject.value) {
      await feathers.service('mapObjects').create(newMapObject.value);
      newMapObject.value = null;
    }
  }

  function positionNewMapObject(svgP: { x: number; y: number }) {
    if (newMapObject.value) {
      newMapObject.value.xPos = svgP.x;
      newMapObject.value.yPos = svgP.y;
    }
  }

  return {
    newMapObject,
    addMapObject,
    saveNewMapObject,
    positionNewMapObject,
  };
}
