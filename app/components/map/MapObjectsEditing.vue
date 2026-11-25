<template>
  <g
    v-for="mapObject in visibleMapObjects"
    :key="mapObject._id"
    data-test="map-object"
    data-space-element-type="map-object"
    :data-space-element-id="mapObject._id"
    transform-origin="center"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos}) rotate(${mapObject.rotation})`"
    class="transform-box-fill"
    :class="{
      'cursor-pointer': !moving && mode === 'none',
      'cursor-move': moving,
      'text-gray-900': !isSelected(mapObject),
      'hover:text-amber-600': !isSelected(mapObject) && mode === 'none',
      'text-amber-600': isSelected(mapObject),
    }"
    @dblclick="emit('dblclickMapObject', mapObject._id)"
  >
    <path v-for="(path, index) in mapObject.bgPaths || []" :key="`bg-${index}`" :d="path" :class="mapObject.link ? 'fill-amber-200' : 'fill-transparent'" />
    <path v-for="(path, index) in mapObject.paths" :key="index" :d="path" class="stroke-current" :class="mapObject.link ? 'fill-amber-200' : 'fill-transparent'" />
  </g>
</template>

<script setup lang="ts">
import type { EditorMode } from './FloorPlanEditing.vue';
import type { EditingMapObject } from '~/composables/useMapEditor';
import { spaceMapKey } from '~/utils/spaceMap';

/** map objects in the editor: can be selected by click and moved by dragging */
const props = defineProps<{
  mode: EditorMode;
  mapObjects: EditingMapObject[];
  selectedMapObjectId?: string;
}>();

const emit = defineEmits<{
  selectMapObject: [id: string | null];
  moveMapObject: [id: string, position: { x: number; y: number }];
  dblclickMapObject: [id: string];
}>();

const moving = ref(false);
const movingOffset = ref<{ x: number; y: number }>();

const spaceMap = inject(spaceMapKey);

spaceMap?.on('move', 'map-object', (id, svgPoint) => {
  if (props.mode !== 'none' || !id) {
    return;
  }
  if (props.selectedMapObjectId !== id) {
    emit('selectMapObject', id);
  }
  const mapObject = props.mapObjects.find(m => m._id === id);
  if (!mapObject) {
    return;
  }
  moving.value = true;
  // remember the offset between pointer and object origin, so the object does not jump on drag start
  movingOffset.value ??= { x: mapObject.xPos - svgPoint.x, y: mapObject.yPos - svgPoint.y };
  emit('moveMapObject', id, { x: svgPoint.x + movingOffset.value.x, y: svgPoint.y + movingOffset.value.y });
});

spaceMap?.on('up', 'map-object', (id) => {
  if (props.mode !== 'none') {
    return;
  }
  if (props.selectedMapObjectId !== id) {
    emit('selectMapObject', id);
  }
  moving.value = false;
  movingOffset.value = undefined;
});

spaceMap?.on('up', 'root', () => {
  if (props.mode === 'none') {
    emit('selectMapObject', null);
  }
});

const isSelected = (mapObject: EditingMapObject) => props.selectedMapObjectId === mapObject._id;

const visibleMapObjects = computed(() => props.mapObjects.filter(m => !m.isDeleted));

useAndRegisterViewBox('MapObjects', mapObjectsToPaths(visibleMapObjects), { strokeWidth: 1 });
</script>
