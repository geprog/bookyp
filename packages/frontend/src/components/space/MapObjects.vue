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
      data-test="map-object-path"
      :d="path"
      :class="{
        'stroke-black text-primary-dark fill-primary-light':
          selectedMapObjectId !== mapObject._id && mapObject.bookable,
        'stroke-current text-primary-dark fill-primary-light': selectedMapObjectId === mapObject._id,
        'stroke-black fill-white': selectedMapObjectId !== mapObject._id && !mapObject.bookable,
      }"
    />
  </g>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, toRef } from 'vue';

import getMapObjects from '~/compositions/space/useMapObjects';
import { Path, useAndRegisterViewBox } from '~/compositions/space/useViewBox';

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
    return { mapObjects, clickOnMapObject };
  },
});
</script>

<style scoped>
.map-object:hover path {
  @apply stroke-primary-dark;
}
</style>
