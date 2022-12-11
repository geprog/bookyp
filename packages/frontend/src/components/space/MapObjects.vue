<template>
  <!-- if the map object is resizable we might need to change the rotation origin -->
  <g
    v-for="mapObject in extendedMapObjects"
    :key="mapObject._id"
    data-test="map-object"
    transform-origin="center"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos}) rotate(${mapObject.rotation})`"
    class="transform-box-fill"
    :class="{
      'cursor-pointer': mapObject.isClickable,
      'map-object': mapObject.isClickable && !considerFilter,
      'map-object-filter-matched': mapObject.isClickable && mapObject.matchesFilter,
      'map-object-filter-unmatched': mapObject.isClickable && !mapObject.matchesFilter,
    }"
    @click.stop="clickOnMapObject(mapObject)"
  >
    <path
      v-for="path in mapObject.paths"
      :key="path"
      :data-test="mapObject.isHighlighted ? 'highlighted-map-object-path' : 'map-object-path'"
      :d="path"
      :class="mapObject.style"
    />
  </g>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, toRef } from 'vue';

import getMapObjects from '~/compositions/space/useMapObjects';
import { mapObjectsToPaths, useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { useBookables } from '~/compositions/useBookables';
import useFind from '~/compositions/useFind';

const props = defineProps<{
  spaceId: string;
  clickable?: boolean;
  considerFilter?: boolean;
  highlightedBookableId?: string;
}>();

const emit = defineEmits<{
  (event: 'clickOnMapObject', __bookableId: Model.MapObject['bookable']): void;
}>();

const clickable = toRef(props, 'clickable');
const highlightedBookableId = toRef(props, 'highlightedBookableId');
const spaceId = toRef(props, 'spaceId');
const considerFilter = toRef(props, 'considerFilter');

const { data: mapObjects } = getMapObjects(spaceId);

const { data: bookables } = useFind(
  'bookables',
  computed(() => ({ paginate: false, query: { space: spaceId.value, $disableSoftDelete: true } })),
);

const { isFilterMatched, isBookedByMe: _isBookedByMe } = useBookables(bookables);

function clickOnMapObject(mapObject: Model.MapObject & { isClickable: boolean }) {
  if (mapObject.isClickable) {
    emit('clickOnMapObject', mapObject.bookable);
  }
}

useAndRegisterViewBox('MapObjects', mapObjectsToPaths(mapObjects), { strokeWidth: 1 });

function getMapObjectStyle(
  mapObject: Model.MapObject,
  isHighlighted: boolean,
  isBookedByMe: boolean,
  isLinkedToDeletedBookable: boolean,
) {
  const highlightStyle = 'stroke-2 stroke-primary-normal filter drop-shadow-orange-glow';

  if (isHighlighted) {
    return highlightStyle + ' fill-primary-light';
  }

  if (!mapObject.bookable || isLinkedToDeletedBookable) {
    return 'stroke-black fill-white';
  }

  if (considerFilter.value) {
    if (isFilterMatched(mapObject.bookable)) {
      return 'stroke-black fill-green-background';
    }

    if (isBookedByMe) {
      return highlightStyle + ' stroke-black fill-red-background';
    }

    return 'stroke-black fill-red-background';
  }

  if (mapObject.bookable && !considerFilter.value) {
    return 'stroke-black fill-white';
  }

  return 'stroke-black fill-primary-light';
}

const extendedMapObjects = computed(() =>
  mapObjects.value.map((mapObject) => {
    const matchesFilter = !!considerFilter.value && !!isFilterMatched(mapObject.bookable);
    const isHighlighted = !!highlightedBookableId.value && highlightedBookableId.value === mapObject.bookable;
    const isBookedByMe = _isBookedByMe(mapObject.bookable);
    const isLinkedToDeletedBookable =
      bookables.value.find((bookable) => bookable._id === mapObject.bookable)?.deleted === true;
    const isClickable = !!clickable.value && !!mapObject.bookable && !isLinkedToDeletedBookable;
    const style = getMapObjectStyle(mapObject, isHighlighted, isBookedByMe, isLinkedToDeletedBookable);

    return {
      ...mapObject,
      isHighlighted,
      style,
      isClickable,
      matchesFilter,
      isLinkedToDeletedBookable,
      isBookedByMe,
    };
  }),
);
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
