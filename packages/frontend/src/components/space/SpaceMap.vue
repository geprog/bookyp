<template>
  <svg
    class="w-full flex-grow"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-test="space-map"
    @mousemove="emitMovePosition"
    @touchmove="emitMovePosition"
    @click.stop="emitClickPosition"
    @mousedown.stop="emitDownPosition"
    @touchstart="emitDownPosition"
    @mouseup.stop="emitUpPosition"
    @touchend="emitUpPosition"
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    moveInsideSvg: (__svgP: DOMPoint) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    downInsideSvg: (__svgP: DOMPoint) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    upInsideSvg: (__svgP: DOMPoint) => true,
  },

  setup(props, context) {
    function getSvgP(e: MouseEvent | TouchEvent): DOMPoint {
      const svg = e.currentTarget as SVGSVGElement;
      const pt = svg.createSVGPoint();

      // pass event coordinates
      if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchcancel') {
        pt.x = (e as TouchEvent).touches[0].pageX;
        pt.y = (e as TouchEvent).touches[0].pageY;
      } else if (
        e.type == 'mousedown' ||
        e.type == 'mouseup' ||
        e.type == 'mousemove' ||
        e.type == 'mouseover' ||
        e.type == 'mouseout' ||
        e.type == 'mouseenter' ||
        e.type == 'mouseleave' ||
        e.type == 'click'
      ) {
        pt.x = (e as MouseEvent).clientX;
        pt.y = (e as MouseEvent).clientY;
      }
      // transform to SVG coordinates
      const matrix = svg.getScreenCTM()?.inverse();
      return pt.matrixTransform(matrix);
    }

    function emitClickPosition(event: MouseEvent | TouchEvent) {
      const svgP = getSvgP(event);
      context.emit('clickInsideSvg', svgP);
    }
    function emitMovePosition(event: MouseEvent | TouchEvent) {
      const svgP = getSvgP(event);
      context.emit('moveInsideSvg', svgP);
    }
    function emitDownPosition(event: MouseEvent | TouchEvent) {
      const svgP = getSvgP(event);
      context.emit('downInsideSvg', svgP);
    }
    function emitUpPosition(event: MouseEvent | TouchEvent) {
      const svgP = getSvgP(event);
      context.emit('upInsideSvg', svgP);
    }
    return { emitClickPosition, emitMovePosition, emitDownPosition, emitUpPosition };
  },
});
</script>
