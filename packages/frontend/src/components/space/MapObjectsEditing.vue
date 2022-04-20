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
      'cursor-pointer': !moving,
      'cursor-move': moving,
    }"
    @click.stop="clickOnMapObject(mapObject)"
    @mousedown.stop="downOnMapObject(mapObject)"
    @touchstart.stop="downOnMapObject(mapObject)"
    @mouseup.stop="upOnMapObject"
    @touchend.stop="upOnMapObject"
  >
    <path
      v-for="path in mapObject.paths"
      :key="path"
      :d="path"
      :class="
        selectedMapObjectId === mapObject._id
          ? 'stroke-current text-primary-dark fill-primary-light'
          : 'stroke-black fill-white'
      "
    />
  </g>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, inject, PropType, Ref, ref, toRef } from 'vue';

import { mapObjectsToPaths, useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { EditingMapObject } from '~/views/settings/space/EditingMapObject';

export default defineComponent({
  name: 'MapObjectsEditing',
  props: {
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
    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    const moving = ref(false);

    const movingOffset = ref({ x: 0, y: 0 });

    function moveSelectedMapObject(svgPoint: DOMPoint) {
      if (moving.value) {
        const selectedMapObjectIndex = mapObjects.value.findIndex(
          (mapObject) => mapObject._id === selectedMapObjectId.value,
        );
        if (selectedMapObjectIndex !== -1 && mapObjects.value[selectedMapObjectIndex]) {
          const mapObject = mapObjects.value[selectedMapObjectIndex];
          // get delta of current position and position of drag start to avoid jump
          // check if moving delta for current drag is already set
          if (movingOffset.value.x === 0 || movingOffset.value.y === 0) {
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
    spaceMap?.on('clickInsideSvg', () => {
      context.emit('selectMapObject', null);
    });
    spaceMap?.on('upInsideSvg', () => {
      moving.value = false;
    });

    const filteredMapObjects = computed(() => mapObjects.value.filter((mapObject) => !mapObject.isDeleted));

    function clickOnMapObject(mapObject: Model.MapObject) {
      // reset moving offset to handle other map object
      movingOffset.value = { x: 0, y: 0 };
      context.emit('selectMapObject', mapObject);
    }

    function downOnMapObject(mapObject: Model.MapObject) {
      context.emit('selectMapObject', mapObject);
      moving.value = true;
    }

    function upOnMapObject() {
      moving.value = false;
    }

    useAndRegisterViewBox('MapObjects', mapObjectsToPaths(mapObjects), { strokeWidth: 1 });
    return { filteredMapObjects, clickOnMapObject, downOnMapObject, upOnMapObject, moving };
  },
});
</script>

<style scoped>
.map-object:hover path {
  @apply stroke-primary-dark;
}
</style>
