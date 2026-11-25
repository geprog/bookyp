<template>
  <g
    v-for="mapObject in extendedMapObjects"
    :key="mapObject._id"
    data-test="map-object"
    transform-origin="center"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos}) rotate(${mapObject.rotation})`"
    class="map-object transform-box-fill"
    :class="[mapObject.style, { clickable: mapObject.isClickable }]"
    :data-availability="mapObject.availability"
    @click.stop="clickOnMapObject(mapObject)"
  >
    <path v-for="(path, index) in mapObject.bgPaths || []" :key="`bg-${index}`" :d="path" class="bg" />
    <path v-for="(path, index) in mapObject.paths" :key="index" :d="path" class="body" data-test="map-object-path" />
  </g>
</template>

<script setup lang="ts">
import type { Bookable, MapObject } from '#shared/types/models';

type Availability = 'free' | 'occupied' | 'occupied-by-me' | 'requested' | 'requested-by-me' | null;

/**
 * Renders the map objects of a space. In `show-availability` mode the objects linked to a
 * bookable are colored by their availability in the selected time range, in `highlight` mode
 * only the given bookable is highlighted (e.g. on the booking details page).
 */
const props = defineProps<{
  spaceId: string;
  clickable?: boolean;
  mode: 'show-availability' | 'highlight';
  highlightedBookableId?: string;
  isAdmin?: boolean;
}>();

const emit = defineEmits<{ clickOnMapObject: [mapObject: MapObject] }>();

const spaceId = toRef(props, 'spaceId');
const { mapObjects } = useMapObjects(spaceId);
const { bookables, isFilterMatched, isBookedByMe, isRequested, isRequestedByMe } = useBookables(spaceId, { includeDeleted: true });

useAndRegisterViewBox('MapObjects', mapObjectsToPaths(computed(() => mapObjects.value ?? [])), { strokeWidth: 1 });

function clickOnMapObject(mapObject: MapObject & { isClickable: boolean }) {
  if (mapObject.isClickable) {
    emit('clickOnMapObject', mapObject);
  }
}

function getAvailability(mapObject: MapObject): Availability {
  if (mapObject.link?.type !== 'bookable') {
    return null;
  }
  const bookableId = mapObject.link.bookable;
  if (isRequestedByMe(bookableId)) {
    return 'requested-by-me';
  }
  if (isRequested(bookableId)) {
    return 'requested';
  }
  if (isBookedByMe(bookableId)) {
    return 'occupied-by-me';
  }
  if (isFilterMatched(bookableId)) {
    return 'free';
  }
  return 'occupied';
}

function getStyle(mapObject: MapObject, isHighlighted: boolean, availability: Availability, isLinkedToDeletedBookable: boolean): string {
  if (!mapObject.link || isLinkedToDeletedBookable) {
    return '';
  }
  if (props.mode === 'highlight') {
    return isHighlighted ? 'highlight' : '';
  }
  if (mapObject.link.type === 'url') {
    return 'linked-to-url';
  }
  if (availability === 'requested-by-me') {
    return 'requested-by-me';
  }
  if (availability === 'requested' && props.isAdmin) {
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

const bookablesById = computed(() => new Map<string, Bookable>((bookables.value ?? []).map(b => [b._id, b])));

const extendedMapObjects = computed(() =>
  (mapObjects.value ?? []).map((mapObject) => {
    const linkedBookable = mapObject.link?.type === 'bookable' ? bookablesById.value.get(mapObject.link.bookable) : undefined;
    const isHighlighted = !!props.highlightedBookableId && mapObject.link?.type === 'bookable' && mapObject.link.bookable === props.highlightedBookableId;
    const isLinkedToDeletedBookable = linkedBookable?.deleted === true;
    const isClickable = !!props.clickable && !!mapObject.link && !isLinkedToDeletedBookable;
    const availability = props.mode === 'show-availability' ? getAvailability(mapObject) : null;
    return {
      ...mapObject,
      isHighlighted,
      style: getStyle(mapObject, isHighlighted, availability, isLinkedToDeletedBookable),
      availability,
      isClickable,
    };
  }),
);
</script>

<style scoped>
.map-object path.body {
  stroke: black;
  fill: transparent;
}
.map-object.clickable {
  cursor: pointer;
}
.map-object.clickable:hover path.body {
  stroke: var(--color-amber-600);
}

.map-object.highlight path {
  fill: var(--color-amber-200);
}
.map-object.highlight path.body {
  stroke: var(--color-amber-600);
}

/* linked to an url */
.map-object.linked-to-url path {
  fill: var(--color-blue-200);
}
.map-object.linked-to-url:hover path.body {
  stroke: var(--color-blue-600);
}

/* free */
.map-object.free path {
  fill: var(--color-emerald-200);
}
.map-object.free:hover path.body {
  stroke: var(--color-emerald-600);
}

/* occupied by someone else */
.map-object.occupied path {
  fill: var(--color-red-200);
}
.map-object.occupied:hover path.body {
  stroke: var(--color-red-600);
}

/* occupied by myself */
.map-object.occupied-by-me {
  filter: drop-shadow(-2px -2px 4px rgba(245, 158, 11, 0.5)) drop-shadow(2px 2px 4px rgba(245, 162, 11, 0.5));
}
.map-object.occupied-by-me path {
  fill: var(--color-red-200);
}
.map-object.occupied-by-me path.body {
  stroke: var(--color-amber-500);
}
.map-object.occupied-by-me:hover path {
  stroke: var(--color-red-600);
}

.map-object.requested-by-me path {
  stroke: var(--color-amber-500);
  fill: var(--color-amber-200);
  filter: drop-shadow(-2px -2px 4px rgba(245, 158, 11, 0.5)) drop-shadow(2px 2px 4px rgba(245, 162, 11, 0.5));
}

.map-object.requested path {
  stroke: black;
  fill: var(--color-amber-200);
}
</style>
