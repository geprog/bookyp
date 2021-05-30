<template>
  <svg
    class="w-full flex-grow"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-test="space-map"
    @click="emitPosition"
  >
    <slot />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SpaceMap',
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clickInsideSvg: (__svgP: DOMPoint) => true,
  },

  setup(props, context) {
    function emitPosition(event: MouseEvent) {
      const svg = event.target as SVGSVGElement;
      const pt = svg.createSVGPoint();

      // pass event coordinates
      pt.x = event.clientX;
      pt.y = event.clientY;

      // transform to SVG coordinates
      const matrix = svg.getScreenCTM()?.inverse();
      const svgP = pt.matrixTransform(matrix);
      context.emit('clickInsideSvg', svgP);
    }
    return { emitPosition };
  },
});
</script>
