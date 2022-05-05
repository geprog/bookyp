<template>
  <!-- if the map object is resizable we might need to change the rotation origin -->
  <g
    v-for="mapObject in filteredMapObjects"
    :key="mapObject._id"
    data-test="map-object"
    transform-origin="center"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos}) rotate(${mapObject.rotation})`"
    class="map-object transform-box-fill"
    :class="{
      'cursor-pointer': !moving && mode === 'none',
      'cursor-move': moving,
      'text-dark-gray': !isSelected(mapObject),
      'hover:text-primary-dark': !isSelected(mapObject) && mode === 'none',
      'text-primary-normal': isSelected(mapObject),
    }"
    @pointerdown="downOnMapObject(mapObject, $event)"
    @pointerup="upOnMapObject"
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

import usePointerCapturing from '~/compositions/space/usePointerCapturing';
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
      type: String,
      default: null,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectMapObject: (__mapObject: Model.MapObject | null) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:mapObjects': (__mapObjects: Ref<Model.MapObject[]>) => true,
  },

  setup(props, context) {
    const mapObjects = toRef(props, 'mapObjects');
    const mode = toRef(props, 'mode');
    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    const moving = ref(false);

    const movingOffset = ref<{ x: number; y: number }>();

    const { setCapture, releaseCapture } = usePointerCapturing();

    function moveSelectedMapObject(svgPoint: DOMPoint, event: PointerEvent) {
      if (moving.value) {
        setCapture(event);
        const selectedMapObjectIndex = mapObjects.value.findIndex(
          (mapObject) => mapObject._id === selectedMapObjectId.value,
        );
        if (selectedMapObjectIndex !== -1 && mapObjects.value[selectedMapObjectIndex]) {
          const mapObject = mapObjects.value[selectedMapObjectIndex];
          // get delta of current position and position of drag start to avoid jump
          // check if moving delta for current drag is already set
          if (movingOffset.value === undefined) {
            movingOffset.value = {
              x: mapObject.xPos - svgPoint.x,
              y: mapObject.yPos - svgPoint.y,
            };
          }
          mapObjects.value[selectedMapObjectIndex].xPos = svgPoint.x + movingOffset.value.x;
          mapObjects.value[selectedMapObjectIndex].yPos = svgPoint.y + movingOffset.value.y;
          context.emit('update:mapObjects', mapObjects);
        }
      }
    }

    const spaceMap = inject(SpaceMapKey);

    spaceMap?.on('moveInsideSvg', moveSelectedMapObject);
    spaceMap?.on('upInsideSvg', () => {
      context.emit('selectMapObject', null);
    });

    const filteredMapObjects = computed(() => mapObjects.value.filter((mapObject) => !mapObject.isDeleted));

    function downOnMapObject(mapObject: Model.MapObject, event: PointerEvent) {
      if (mode.value !== 'none') {
        return;
      }
      // reset moving offset to handle other map object
      movingOffset.value = undefined;
      context.emit('selectMapObject', mapObject);
      moving.value = true;
      event.stopPropagation();
    }

    function upOnMapObject(event: PointerEvent) {
      if (mode.value !== 'none') {
        return;
      }
      moving.value = false;
      releaseCapture();
      event.stopPropagation();
    }

    function isSelected(mapObject: Model.MapObject) {
      return selectedMapObjectId.value === mapObject._id;
    }

    useAndRegisterViewBox('MapObjects', mapObjectsToPaths(mapObjects), { strokeWidth: 1 });
    return { filteredMapObjects, downOnMapObject, upOnMapObject, moving, isSelected };
  },
});
</script>
