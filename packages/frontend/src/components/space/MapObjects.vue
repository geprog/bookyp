<template>
  <g
    v-for="mapObject in mapObjects"
    :key="mapObject._id"
    data-test="map-object"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos})`"
    :class="{
      'cursor-pointer':
        isMapObjectClickable(mapObject) && (!considerFilter || isFilterMatched(mapObject.bookable) !== false),
      'map-object':
        isMapObjectClickable(mapObject) && (!considerFilter || isFilterMatched(mapObject.bookable) === null),
      'map-object-filter-matched':
        isMapObjectClickable(mapObject) && considerFilter && isFilterMatched(mapObject.bookable) === true,
      'cursor-not-allowed map-object-filter-unmatched':
        isMapObjectClickable(mapObject) && considerFilter && isFilterMatched(mapObject.bookable) === false,
    }"
    @click.stop="clickOnMapObject(mapObject)"
  >
    <path
      v-for="path in mapObject.paths"
      :key="path"
      data-test="map-object-path"
      :d="path"
      :class="{
        'stroke-black fill-primary-light':
          selectedMapObjectId !== mapObject._id &&
          mapObject.bookable &&
          (!considerFilter || isFilterMatched(mapObject.bookable) === null) &&
          isMapObjectLinkedToDeletedBookable(mapObject) === false,
        'stroke-black fill-green-background':
          considerFilter &&
          isFilterMatched(mapObject.bookable) === true &&
          isMapObjectLinkedToDeletedBookable(mapObject) === false,
        'stroke-black fill-red-background':
          considerFilter &&
          isFilterMatched(mapObject.bookable) === false &&
          isMapObjectLinkedToDeletedBookable(mapObject) === false,
        'stroke-current fill-primary-light':
          selectedMapObjectId === mapObject._id && isMapObjectLinkedToDeletedBookable(mapObject) === false,
        'stroke-black fill-white':
          selectedMapObjectId !== mapObject._id &&
          (!mapObject.bookable || isMapObjectLinkedToDeletedBookable(mapObject) === true),
      }"
    />
  </g>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, toRef } from 'vue';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import getMapObjects from '~/compositions/space/useMapObjects';
import { Path, useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'MapObjects',
  props: {
    clickable: {
      type: Boolean,
    },

    considerFilter: {
      type: Boolean,
    },

    selectedMapObjectId: {
      type: String,
      default: null,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clickOnMapObject: (__mapObject: Model.MapObject) => true,
  },

  setup(props, context) {
    const clickable = toRef(props, 'clickable');
    const { data: mapObjects } = getMapObjects();
    const { spaceId } = useCurrentSpace();

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value, $disableSoftDelete: true } })),
    );
    const { isFilterMatched } = useBookablesFilter(bookables);

    function isMapObjectLinkedToDeletedBookable(mapObject: Model.MapObject) {
      return bookables.value.find((bookable) => bookable._id === mapObject.bookable)?.deleted === true;
    }

    function isMapObjectClickable(mapObject: Model.MapObject): boolean {
      return clickable.value && 'bookable' in mapObject && isMapObjectLinkedToDeletedBookable(mapObject) === false;
    }

    function clickOnMapObject(mapObject: Model.MapObject) {
      if (isMapObjectClickable(mapObject) && isFilterMatched(mapObject.bookable) !== false) {
        context.emit('clickOnMapObject', mapObject);
      }
    }

    const mapObjectPaths = computed(() =>
      mapObjects.value.reduce<Path[]>((allPaths, mapObject) => {
        const paths = mapObject.paths.map((path) => ({
          x: mapObject.xPos,
          y: mapObject.yPos,
          d: path,
        }));
        return [...allPaths, ...paths];
      }, []),
    );
    useAndRegisterViewBox('MapObjects', mapObjectPaths, { strokeWidth: 1 });

    return { mapObjects, clickOnMapObject, isFilterMatched, isMapObjectClickable, isMapObjectLinkedToDeletedBookable };
  },
});
</script>

<style scoped>
.map-object:hover path {
  @apply stroke-primary-dark;
}

.map-object-filter-matched:hover path {
  @apply stroke-green-text;
}

.map-object-filter-unmatched:hover path {
  @apply stroke-black;
}
</style>
