import type { Ref } from 'vue';
import type { MapObject } from '#shared/types/models';
import type { MapObjectTypeDefinition } from '#shared/utils/mapObjectTypes';

/** a map object in the editor; new ones have a negative id until they are saved */
export type EditingMapObject = MapObject & { isDeleted?: boolean };

let newMapObjectCounter = 0;

export function isNewMapObject(mapObject: Pick<MapObject, '_id'>): boolean {
  return mapObject._id.startsWith('new-');
}

/**
 * The working copy of the map (floor plan and map objects) in the editor.
 * Changes are kept locally until they are saved in one go.
 */
export function useMapEditor(spaceId: Ref<string>, floorPlanSource: Ref<string[]>, mapObjectsSource: Ref<MapObject[] | undefined>) {
  const floorPlan = ref<string[]>([...floorPlanSource.value]);
  const mapObjects = ref<EditingMapObject[]>([]);
  const changed = ref(false);

  function resetFromSource() {
    floorPlan.value = [...floorPlanSource.value];
    mapObjects.value = structuredClone(toRaw(mapObjectsSource.value ?? [])).map(m => ({ ...m }));
    changed.value = false;
  }

  // keep following the server state as long as nothing was changed locally
  watch([floorPlanSource, mapObjectsSource], () => {
    if (!changed.value) {
      resetFromSource();
    }
  }, { immediate: true, deep: true });

  function updateFloorPlan(value: string[]) {
    floorPlan.value = value;
    changed.value = true;
  }

  function updateMapObject(id: string, update: Partial<EditingMapObject>) {
    const index = mapObjects.value.findIndex(m => m._id === id);
    if (index === -1) {
      return;
    }
    mapObjects.value[index] = { ...mapObjects.value[index]!, ...update };
    changed.value = true;
  }

  function addMapObject(type: MapObjectTypeDefinition, bgPaths: string[]): EditingMapObject {
    newMapObjectCounter += 1;
    const mapObject: EditingMapObject = {
      _id: `new-${newMapObjectCounter}`,
      xPos: 0,
      yPos: 0,
      rotation: 0,
      paths: type.paths,
      bgPaths: type.bgPaths ?? bgPaths,
      type: type.name,
      space: spaceId.value,
    };
    mapObjects.value = [...mapObjects.value, mapObject];
    changed.value = true;
    return mapObject;
  }

  function removeMapObject(id: string) {
    updateMapObject(id, { isDeleted: true });
  }

  function removeFloorPlanObject(index: number) {
    const updated = [...floorPlan.value];
    updated.splice(index, 1);
    updateFloorPlan(updated);
  }

  /** the payload for `PUT /api/spaces/:id/map-objects` */
  function toSavePayload() {
    return mapObjects.value
      .filter(m => !m.isDeleted)
      .map(({ _id, isDeleted: _deleted, ...rest }) => ({ ...rest, ...(isNewMapObject({ _id }) ? {} : { _id }) }));
  }

  return { floorPlan, mapObjects, changed, resetFromSource, updateFloorPlan, updateMapObject, addMapObject, removeMapObject, removeFloorPlanObject, toSavePayload };
}
