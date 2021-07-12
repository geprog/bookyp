<template>
  <g
    v-for="mapObject in mapObjects"
    :key="mapObject._id"
    data-test="map-object"
    :transform="`translate(${mapObject.xPos},${mapObject.yPos})`"
    :class="{ 'cursor-pointer map-object': clickable }"
    @click.stop="clickOnMapObject(mapObject)"
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
import { defineComponent, toRef } from 'vue';

import getMapObjects from '~/compositions/space/useMapObjects';

export default defineComponent({
  name: 'MapObjects',
  props: {
    clickable: {
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

    function clickOnMapObject(mapObject: Model.MapObject) {
      if (!clickable.value) {
        return;
      }

      context.emit('clickOnMapObject', mapObject);
    }

    return { mapObjects, clickOnMapObject };
  },
});
</script>

<style scoped>
.map-object:hover path {
  @apply stroke-primary-dark;
}
</style>
