<template>
  <!-- if the map object is resizable we might need to change the rotation origin -->
  <g
    v-for="mapObject in filteredMapObjects"
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
      'text-dark-gray': !isSelected(mapObject),
      'hover:text-primary-dark': !isSelected(mapObject) && mode === 'none',
      'text-primary-normal': isSelected(mapObject),
    }"
  >
    <path
      v-for="path in mapObject.paths"
      :key="path"
      :d="path"
      class="stroke-current"
      :class="{
        'fill-primary-light': mapObject.bookable !== undefined,
        'fill-white': mapObject.bookable === undefined,
      }"
    />
  </g>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, inject, PropType, Ref, ref, toRef } from 'vue';

import { mapObjectsToPaths, useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { Mode } from '~/views/settings/Space.vue';
import { EditingMapObject } from '~/views/settings/space/EditingMapObject';

export default defineComponent({
  name: 'MapObjectsEditing',
  props: {
    mode: {
      type: String as PropType<Mode>,
      required: true,
    },

    mapObjects: {
      type: Array as PropType<EditingMapObject[]>,
      required: true,
    },

    selectedMapObjectId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectMapObject: (__id: string | null) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:mapObjects': (__mapObjects: Ref<Model.MapObject[]>) => true,
  },

  setup(props, context) {
    const mapObjects = toRef(props, 'mapObjects');
    const mode = toRef(props, 'mode');
    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    const moving = ref(false);

    const movingOffset = ref<{ x: number; y: number }>();

    const spaceMap = inject(SpaceMapKey);

    spaceMap?.on('move', 'map-object', (id: string | null, svgPoint: DOMPoint) => {
      if (mode.value !== 'none') {
        return;
      }
      if (selectedMapObjectId.value !== id) {
        context.emit('selectMapObject', id);
      }
      const mapObject = mapObjects.value.find(({ _id: mapObjectId }) => mapObjectId === id);
      if (mapObject) {
        moving.value = true;
        // get delta of current position and position of drag start to avoid jump
        // check if moving delta for current drag is already set
        if (movingOffset.value === undefined) {
          movingOffset.value = {
            x: mapObject.xPos - svgPoint.x,
            y: mapObject.yPos - svgPoint.y,
          };
        }
        mapObject.xPos = svgPoint.x + movingOffset.value.x;
        mapObject.yPos = svgPoint.y + movingOffset.value.y;
        context.emit('update:mapObjects', mapObjects);
      }
    });

    spaceMap?.on('up', 'map-object', (id) => {
      // select map object when clicked on one
      if (mode.value !== 'none') {
        return;
      }
      if (selectedMapObjectId.value !== id) {
        context.emit('selectMapObject', id);
      }
      moving.value = false;
      movingOffset.value = undefined;
    });

    spaceMap?.on('up', 'root', () => {
      // unselect map object when clicking on nothing
      if (mode.value !== 'none') {
        return;
      }
      context.emit('selectMapObject', null);
    });

    function isSelected(mapObject: Model.MapObject) {
      return selectedMapObjectId.value === mapObject._id;
    }

    const filteredMapObjects = computed(() => mapObjects.value.filter((mapObject) => !mapObject.isDeleted));

    useAndRegisterViewBox('MapObjects', mapObjectsToPaths(mapObjects), { strokeWidth: 1 });

    return { filteredMapObjects, moving, isSelected };
  },
});
</script>
