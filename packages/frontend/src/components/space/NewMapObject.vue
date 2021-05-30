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
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'NewMapObject',
  props: {
    newMapObject: {
      type: Object as PropType<Omit<Model.MapObject, '_id'>>,
      required: true,
    },
  },
});
</script>

<style scoped>
.map-object:hover path {
  @apply stroke-primary-dark;
}
</style>
