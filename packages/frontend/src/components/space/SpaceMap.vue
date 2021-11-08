<template>
  <svg
    class="w-full flex-grow p-8 min-h-0"
    :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-test="space-map"
    @mousemove="emitPosition($event, 'moveInsideSvg')"
    @touchmove="emitPosition($event, 'moveInsideSvg')"
    @click.stop="emitPosition($event, 'clickInsideSvg')"
    @mousedown.stop="emitPosition($event, 'downInsideSvg')"
    @touchstart="emitPosition($event, 'downInsideSvg')"
    @mouseup.stop="emitUpInsideSvg"
    @touchend.stop="emitUpInsideSvg"
  >
    <slot />
  </svg>
</template>

<script lang="ts">
import EventEmitter from 'events';
import { computed, defineComponent, provide, Ref, ref } from 'vue';

import { combineViewBoxes, EMPTY_VIEW_BOX, ViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapEvents, SpaceMapKey } from '~/symbols/space-map';

export default defineComponent({
  name: 'SpaceMap',
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clickInsideSvg: (__svgPoint: DOMPoint) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    moveInsideSvg: (__svgPoint: DOMPoint) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    downInsideSvg: (__svgPoint: DOMPoint) => true,
    upInsideSvg: () => true,
  },

  setup(props, context) {
    const spaceMapEventEmitter = new EventEmitter();
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
      on(event, listener) {
        spaceMapEventEmitter.on(event, listener);
      },
    });

    function getSvgPoint(e: MouseEvent | TouchEvent): DOMPoint | undefined {
      const svg = e.currentTarget as SVGSVGElement;
      const pt = svg.createSVGPoint();

      // pass event coordinates
      if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchcancel') {
        pt.x = (e as TouchEvent).touches[0].clientX;
        pt.y = (e as TouchEvent).touches[0].clientY;
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
      } else {
        throw new Error("Can't get point from event: Unsupported event type");
      }

      // transform to SVG coordinates
      const transformMatrix = svg.getScreenCTM();
      if (!transformMatrix) {
        throw new Error("Can't get screen transform matrix");
      }
      return pt.matrixTransform(transformMatrix.inverse());
    }

    function emitPosition(event: MouseEvent | TouchEvent, eventName: SpaceMapEvents) {
      const svgPoint = getSvgPoint(event);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      context.emit(eventName, svgPoint); // TODO find proper way to type this see https://github.com/Microsoft/TypeScript/issues/14107
      spaceMapEventEmitter.emit(eventName, svgPoint);
    }

    function emitUpInsideSvg() {
      spaceMapEventEmitter.emit('upInsideSvg');
      context.emit('upInsideSvg');
    }

    return { viewBox, emitPosition, emitUpInsideSvg };
  },
});
</script>
