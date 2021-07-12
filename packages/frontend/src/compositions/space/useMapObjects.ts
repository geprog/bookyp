import { Model } from '@bookyp/core';
import { UseFind } from '@geprog/use-feathers';
import { ref } from 'vue';

import useFind from '~/compositions/useFind';

let mapObjects: UseFind<Model.MapObject> | undefined = undefined;

export default function getMapObjects(): UseFind<Model.MapObject> {
  if (!mapObjects) {
    mapObjects = useFind('mapObjects', ref({ paginate: false, query: {} }), {
      disableUnloadingEventHandlers: true,
    });
  }
  return mapObjects;
}
