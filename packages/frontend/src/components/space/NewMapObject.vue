<template>
  <g data-test="new-map-object" :transform="`translate(${newMapObject.xPos},${newMapObject.yPos})`">
    <path
      v-for="path in newMapObject.paths"
      :key="path"
      :d="path"
      class="map-object stroke-current text-primary-dark fill-primary-light"
    />
  </g>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, PropType } from 'vue';

import { Path, useAndRegisterViewBox } from '~/compositions/space/useViewBox';

export default defineComponent({
  name: 'NewMapObject',
  props: {
    newMapObject: {
      type: Object as PropType<Omit<Model.MapObject, '_id'>>,
      required: true,
    },
  },

  setup(props) {
    const mapObjectPaths = computed(() => {
      const mapObject = props.newMapObject;
      const paths = mapObject.paths.map<Path>((path) => ({
        x: mapObject.xPos,
        y: mapObject.yPos,
        d: path,
      }));
      return paths;
    });

    useAndRegisterViewBox('NewMapObject', mapObjectPaths, { strokeWidth: 1 });
  },
});
</script>

<style scoped>
.map-object:hover path {
  @apply stroke-primary-dark;
}
</style>
