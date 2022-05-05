<template>
  <svg
    class="w-full flex-grow p-4 min-h-0 touch-none"
    :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-test="space-map"
    @pointermove.stop="emitPosition($event, 'moveInsideSvg')"
    @pointerdown.stop="emitPosition($event, 'downInsideSvg')"
    @pointerup.stop="emitPosition($event, 'upInsideSvg')"
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

  setup() {
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

    function getSvgPoint(e: PointerEvent): DOMPoint | undefined {
      const svg = e.currentTarget as SVGSVGElement;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;

      // transform to SVG coordinates
      const transformMatrix = svg.getScreenCTM();
      if (!transformMatrix) {
        throw new Error("Can't get screen transform matrix");
      }
      return pt.matrixTransform(transformMatrix.inverse());
    }

    function emitPosition(event: PointerEvent, eventName: SpaceMapEvents) {
      const svgPoint = getSvgPoint(event);
      spaceMapEventEmitter.emit(eventName, svgPoint, event);
    }

    return { viewBox, emitPosition };
  },
});
</script>
