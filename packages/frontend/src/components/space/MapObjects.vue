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
          (!considerFilter || isFilterMatched(mapObject.bookable) === null),
        'stroke-black fill-green-background': considerFilter && isFilterMatched(mapObject.bookable) === true,
        'stroke-black fill-red-background': considerFilter && isFilterMatched(mapObject.bookable) === false,
        'stroke-current fill-primary-light': selectedMapObjectId === mapObject._id,
        'stroke-black fill-white': selectedMapObjectId !== mapObject._id && !mapObject.bookable,
      }"
    />
  </g>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, toRef } from 'vue';

import { spaceId } from '~/compositions/space/useCurrentSpace';
import getMapObjects from '~/compositions/space/useMapObjects';
import { Path, useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'MapObjects',
  props: {
    // eslint-disable-next-line vue/no-unused-properties
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

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );
    const { isFilterMatched } = useBookablesFilter(bookables);

    function isMapObjectClickable(mapObject: Model.MapObject): boolean {
      return clickable.value && 'bookable' in mapObject;
    }

    function clickOnMapObject(mapObject: Model.MapObject) {
      if (isMapObjectClickable(mapObject) && isFilterMatched(mapObject.bookable)) {
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

    return { mapObjects, clickOnMapObject, isFilterMatched, isMapObjectClickable };
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
