<template>
  <!-- if the map object is resizable we might need to change the rotation origin -->
  <g
    v-for="mapObject in extendedMapObjects"
    :key="mapObject._id"
    data-test="map-object"
    transform-origin="center"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos}) rotate(${mapObject.rotation})`"
    class="transform-box-fill map-object"
    :class="{
      clickable: mapObject.isClickable,
      [mapObject.style]: true,
    }"
    @click.stop="clickOnMapObject(mapObject)"
  >
    <path
      v-for="path in mapObject.paths"
      :key="path"
      :data-test="mapObject.isHighlighted ? 'highlighted-map-object-path' : 'map-object-path'"
      :data-availability="mapObject.availability"
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
  mode: 'show-availability' | 'highlight';
  highlightedBookableId?: string;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{
  (event: 'clickOnMapObject', mapObject: Model.MapObject): void;
}>();

const mode = toRef(props, 'mode');
const clickable = toRef(props, 'clickable');
const isAdmin = toRef(props, 'isAdmin');
const highlightedBookableId = toRef(props, 'highlightedBookableId');
const spaceId = toRef(props, 'spaceId');

const { data: mapObjects } = getMapObjects(spaceId);

const { data: bookables } = useFind(
  'bookables',
  computed(() => ({ paginate: false, query: { space: spaceId.value, $disableSoftDelete: true } })),
);

const { isFilterMatched, isBookedByMe, isRequested, isRequestedByMe } = useBookables(bookables);

function clickOnMapObject(mapObject: Model.MapObject & { isClickable: boolean }) {
  if (mapObject.isClickable) {
    emit('clickOnMapObject', mapObject);
  }
}

useAndRegisterViewBox('MapObjects', mapObjectsToPaths(mapObjects), { strokeWidth: 1 });

function getMapObjectStyle(
  mapObject: Model.MapObject,
  _mode: 'show-availability' | 'highlight',
  isHighlighted: boolean,
  availability: 'free' | 'occupied' | 'occupied-by-me' | 'requested' | 'requested-by-me' | null,
  isLinkedToDeletedBookable: boolean,
) {
  // not linked
  if (!mapObject.link || isLinkedToDeletedBookable) {
    return '';
  }

  // in highlight mode (e.g. used for booking details)
  if (_mode === 'highlight') {
    if (isHighlighted) {
      return 'highlight';
    }

    return '';
  }

  // in booking mode
  if (_mode === 'show-availability') {
    if (mapObject.link.type === 'url') {
      return 'linked-to-url';
    }
    if (availability === 'requested-by-me') {
      return 'requested-by-me';
    }

    if (availability === 'requested' && isAdmin.value) {
      return 'requested';
    }

    if (availability === 'occupied-by-me') {
      return 'occupied-by-me';
    }

    if (availability === 'free') {
      return 'free';
    }

    return 'occupied';
  }

  return '';
}

function getMapObjectAvailability(mapObject: Model.MapObject) {
  if (mapObject.link?.type !== 'bookable') {
    return null;
  }
  if (isRequestedByMe(mapObject.link?.bookable)) {
    return 'requested-by-me';
  }

  if (isRequested(mapObject.link?.bookable)) {
    return 'requested';
  }

  if (isBookedByMe(mapObject.link?.bookable)) {
    return 'occupied-by-me';
  }

  if (isFilterMatched(mapObject.link?.bookable)) {
    return 'free';
  }

  return 'occupied';
}

const extendedMapObjects = computed(() =>
  mapObjects.value.map((mapObject) => {
    const isHighlighted =
      !!highlightedBookableId.value &&
      mapObject.link?.type === 'bookable' &&
      highlightedBookableId.value === mapObject.link?.bookable;
    const isLinkedToDeletedBookable =
      mapObject.link?.type === 'bookable' &&
      bookables.value.find((bookable) => bookable._id === (mapObject.link as { bookable: string }).bookable)
        ?.deleted === true; // TODO: remove after tightly coupling map-object and bookable
    const isClickable = !!clickable.value && !!mapObject.link && !isLinkedToDeletedBookable;
    const availability = mode.value === 'show-availability' ? getMapObjectAvailability(mapObject) : null;
    const style = getMapObjectStyle(mapObject, mode.value, isHighlighted, availability, isLinkedToDeletedBookable);

    return {
      ...mapObject,
      isHighlighted,
      style,
      availability,
      isClickable,
    };
  }),
);
</script>

<style scoped>
.map-object path {
  @apply stroke-black fill-white;
}
.map-object.clickable {
  @apply cursor-pointer;
}
.map-object.clickable:hover path {
  @apply stroke-primary-dark;
}

.map-object.highlight path {
  @apply stroke-primary-dark fill-primary-light;
}

/** map-object linked to an url */
.map-object.linked-to-url path {
  @apply stroke-black fill-blue-200;
}
.map-object.linked-to-url:hover path {
  @apply stroke-blue-text;
}

/** map-object free */
.map-object.free path {
  @apply stroke-black fill-green-200;
}
.map-object.free:hover path {
  @apply stroke-green-text fill-green-background;
}

/** map-object occupied by someone else */
.map-object.occupied path {
  @apply stroke-black fill-red-background;
}
.map-object.occupied:hover path {
  @apply stroke-red-text;
}

/** map-object which is occupied by myself */
.map-object.occupied-by-me {
  @apply filter drop-shadow-orangeGlow;
}
.map-object.occupied-by-me path {
  @apply stroke-primary-normal fill-red-background;
}

.map-object.requested-by-me path {
  @apply stroke-primary-normal fill-primary-light filter drop-shadow-orangeGlow;
}

.map-object.requested path {
  @apply stroke-black fill-primary-light;
}

.map-object.occupied-by-me:hover path {
  @apply stroke-red-text;
}
</style>
