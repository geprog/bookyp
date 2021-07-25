<template>
  <svg
    class="w-full flex-grow p-8 min-h-0"
    :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
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
import { computed, defineComponent, provide, Ref, ref } from 'vue';

import { combineViewBoxes, EMPTY_VIEW_BOX, ViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';

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
    const viewBoxRegistry: Record<string, number> = {};
    const childViewBoxes = ref<Ref<ViewBox>[]>([]);
    const viewBox = computed<ViewBox>(() => {
      const viewBoxes = childViewBoxes.value.map((childViewBox) => childViewBox.value);
      return viewBoxes.reduce(combineViewBoxes, EMPTY_VIEW_BOX);
    });
    provide(SpaceMapKey, {
      registerViewBox(key, childViewBox) {
        if (viewBoxRegistry[key]) {
          throw new Error(`A view box with key ${key} is already registered`);
        }
        viewBoxRegistry[key] = childViewBoxes.value.length;
        childViewBoxes.value.push(childViewBox);
      },
      unregisterViewBox(key) {
        if (viewBoxRegistry[key] === undefined) {
          throw new Error(`A view box with key ${key} has never been registered`);
        }
        childViewBoxes.value.splice(viewBoxRegistry[key], 1);
        delete viewBoxRegistry[key];
      },
    });

    function getSvgP(e: MouseEvent | TouchEvent): DOMPoint {
      const svg = e.currentTarget as SVGSVGElement;
      const pt = svg.createSVGPoint();

      // pass event coordinates
      if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchcancel') {
        pt.x = (e as TouchEvent).touches[0].pageX;
        pt.y = (e as TouchEvent).touches[0].pageY;
      } else if (
        e.type === 'mousedown' ||
        e.type === 'mouseup' ||
        e.type === 'mousemove' ||
        e.type === 'mouseover' ||
        e.type === 'mouseout' ||
        e.type === 'mouseenter' ||
        e.type === 'mouseleave' ||
        e.type === 'click'
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
    return { viewBox, emitClickPosition, emitMovePosition, emitDownPosition, emitUpPosition };
  },
});
</script>
