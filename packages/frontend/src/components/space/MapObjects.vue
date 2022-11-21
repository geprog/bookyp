<template>
  <!-- if the map object is resizable we might need to change the rotation origin -->
  <g
    v-for="mapObject in highlightedMapObjects"
    :key="mapObject._id"
    data-test="map-object"
    transform-origin="center"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos}) rotate(${mapObject.rotation})`"
    class="transform-box-fill"
    :class="{
      'cursor-pointer': isMapObjectClickable(mapObject),
      'map-object':
        isMapObjectClickable(mapObject) && (!considerFilter || isFilterMatched(mapObject.bookable) === null),
      'map-object-filter-matched':
        isMapObjectClickable(mapObject) && considerFilter && isFilterMatched(mapObject.bookable) === true,
      'map-object-filter-unmatched':
        isMapObjectClickable(mapObject) && considerFilter && isFilterMatched(mapObject.bookable) === false,
    }"
    @click.stop="clickOnMapObject(mapObject)"
  >
    <path
      v-for="path in mapObject.paths"
      :key="path"
      :data-test="mapObject.highlighted ? 'highlighted-map-object-path' : 'map-object-path'"
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
        'stroke-2 stroke-primary-normal fill-red-background filter drop-shadow-orangeGlow':
          considerFilter &&
          isFilterMatched(mapObject.bookable) === false &&
          isMapObjectLinkedToDeletedBookable(mapObject) === false &&
          mapObject.highlighted,
        'stroke-black fill-red-background':
          considerFilter &&
          isFilterMatched(mapObject.bookable) === false &&
          isMapObjectLinkedToDeletedBookable(mapObject) === false &&
          !mapObject.highlighted,
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

import getMapObjects from '~/compositions/space/useMapObjects';
import { mapObjectsToPaths, useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { useBookables } from '~/compositions/useBookables';
import useFind from '~/compositions/useFind';

type HighlightedMapObject = Model.MapObject & {
  highlighted: boolean;
};

export default defineComponent({
  name: 'MapObjects',
  props: {
    spaceId: {
      type: String,
      required: true,
    },

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

    highlightedBookableId: {
      type: String,
      default: null,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clickOnMapObject: (__bookableId: Model.MapObject['bookable']) => true,
  },

  setup(props, context) {
    const clickable = toRef(props, 'clickable');
    const highlightedBookableId = toRef(props, 'highlightedBookableId');
    const spaceId = toRef(props, 'spaceId');
    const { data: mapObjects } = getMapObjects(spaceId);

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );

    const { isFilterMatched, isBookedByMe } = useBookables(bookables);

    const highlightedMapObjects = computed<HighlightedMapObject[]>(() =>
      mapObjects.value.map((mapObject) => {
        let highlighted = false;
        if (mapObject.bookable === highlightedBookableId.value) {
          highlighted = true;
        }
        if (highlightedBookableId.value === null) {
          highlighted = isBookedByMe(mapObject.bookable);
        }
        return { ...mapObject, highlighted };
      }),
    );

    function isMapObjectLinkedToDeletedBookable(mapObject: HighlightedMapObject) {
      return bookables.value.find((bookable) => bookable._id === mapObject.bookable)?.deleted === true;
    }

    function isMapObjectClickable(mapObject: HighlightedMapObject): boolean {
      return clickable.value && 'bookable' in mapObject && isMapObjectLinkedToDeletedBookable(mapObject) === false;
    }

    function clickOnMapObject(mapObject: HighlightedMapObject) {
      if (isMapObjectClickable(mapObject)) {
        context.emit('clickOnMapObject', mapObject.bookable);
      }
    }

    useAndRegisterViewBox('MapObjects', mapObjectsToPaths(mapObjects), { strokeWidth: 1 });

    return {
      clickOnMapObject,
      isFilterMatched,
      isMapObjectClickable,
      isMapObjectLinkedToDeletedBookable,
      highlightedMapObjects,
    };
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
  @apply stroke-red-text;
}
</style>
