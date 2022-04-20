<template>
  <g
    data-test="new-map-object"
    class="transform-box-fill"
    :transform="`translate(${newMapObject.xPos},${newMapObject.yPos}) rotation(${newMapObject.rotation})`"
  >
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
import { computed, defineComponent, PropType, toRef } from 'vue';

import { mapObjectsToPaths, useAndRegisterViewBox } from '~/compositions/space/useViewBox';

export default defineComponent({
  name: 'NewMapObject',
  props: {
    newMapObject: {
      type: Object as PropType<Omit<Model.MapObject, '_id'>>,
      required: true,
    },
  },

  setup(props) {
    const newMapObject = toRef(props, 'newMapObject');
    useAndRegisterViewBox('NewMapObject', mapObjectsToPaths(computed(() => [newMapObject.value])), { strokeWidth: 1 });
  },
});
</script>

<style scoped>
.map-object:hover path {
  @apply stroke-primary-dark;
}
</style>
