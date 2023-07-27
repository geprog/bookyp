<template>
  <svg
    ref="svgElement"
    class="w-full flex-grow min-h-0 touch-none"
    :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-space-element-type="root"
    data-test="space-map"
    @pointermove.capture="emitPosition($event, 'move')"
    @pointerdown.capture="emitPosition($event, 'down')"
    @pointerup.capture="emitPosition($event, 'up')"
    @wheel.passive.stop="zoomByMouseWheel"
    @touchstart.passive.stop="startZoomByTouch"
    @touchmove.passive.stop="zoomByTouch"
    @touchend.passive.stop="endZoomByTouch"
  >
    <slot />
  </svg>
</template>

<script lang="ts" setup>
import EventEmitter from 'events';
import { computed, provide, Ref, ref, toRef, watch } from 'vue';

import { combineViewBoxes, EMPTY_VIEW_BOX, ViewBox } from '~/compositions/space/useViewBox';
import { SpaceEventTypes, SpaceMapKey, SpaceObjectTypes } from '~/symbols/space-map';

const props = defineProps<{
  disablePanning?: boolean;
  disableControl?: boolean;
}>();

const disablePanning = toRef(props, 'disablePanning');
const disableControl = toRef(props, 'disableControl');

const freezeViewBox = ref(false);
const svgElement = ref<SVGSVGElement>();
const spaceMapEventEmitter = new EventEmitter();
const viewBoxRegistry: Record<string, number> = {};
const childViewBoxes = ref<Ref<ViewBox>[]>([]);
const totalViewBox = computed<ViewBox>(() => {
  const viewBoxes = childViewBoxes.value.map((childViewBox) => childViewBox.value);
  const box = viewBoxes.reduce(combineViewBoxes, EMPTY_VIEW_BOX);
  if (box.width === 0) {
    box.width = 200;
    box.x -= 100;
  }
  if (box.height === 0) {
    box.height = 200;
    box.y -= 100;
  }
  return box;
});
const cachedViewBox = ref({ ...totalViewBox.value });
watch(
  totalViewBox,
  (newValue) => {
    if (!freezeViewBox.value) {
      cachedViewBox.value = { ...newValue };
    }
  },
  { immediate: true },
);
const transformMatrix = ref({ translateX: 0, translateY: 0, scale: 1 });
const viewBox = computed<ViewBox>(() => {
  const { x, y, width, height } = cachedViewBox.value;
  const { translateX, translateY, scale } = transformMatrix.value;
  return { x: x + translateX, y: y + translateY, width: width * scale, height: height * scale };
});

function getEventName(eventType: SpaceEventTypes, objectType: SpaceObjectTypes): string {
  return `${eventType} || ${objectType}`;
}

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
  on(eventType, objectType, listener) {
    spaceMapEventEmitter.on(getEventName(eventType, objectType), listener);
  },
});

function getSvgPoint(x: number, y: number): { x: number; y: number } {
  if (!svgElement.value) {
    throw new Error('Unable transform svg point because svg element unknown');
  }
  const pt = svgElement.value.createSVGPoint();
  pt.x = x;
  pt.y = y;

  // transform to SVG coordinates
  const transformMatrixSVG = svgElement.value.getScreenCTM();
  if (!transformMatrixSVG) {
    throw new Error("Can't get screen transform matrix");
  }
  const { x: xt, y: yt } = pt.matrixTransform(transformMatrixSVG.inverse());
  return { x: xt, y: yt };
}

type ElementInfo = { objectType: SpaceObjectTypes; id: string | null };

function getSpaceElementInfo(event: PointerEvent): ElementInfo | undefined {
  const elements = [...(event.composedPath() as Element[])];
  while (elements.length > 0) {
    const element = elements.shift() as Element;
    const objectTypes: SpaceObjectTypes[] = ['root', 'map-object', 'wall', 'wall-start', 'wall-end'];
    while (objectTypes.length > 0) {
      const objectType = objectTypes.shift() as SpaceObjectTypes;
      if (element.getAttribute('data-space-element-type') === objectType) {
        return { objectType, id: element.getAttribute('data-space-element-id') };
      }
    }
  }
  return undefined;
}

function pan(dx: number, dy: number) {
  transformMatrix.value.translateX += dx;
  transformMatrix.value.translateY += dy;
}

function zoom(ds: number, center: { x: number; y: number }) {
  if (transformMatrix.value.scale + ds <= 0) {
    return;
  }

  const panFactor = -ds / transformMatrix.value.scale;
  pan(panFactor * (center.x - viewBox.value.x), panFactor * (center.y - viewBox.value.y));
  transformMatrix.value.scale += ds;
}

const panning = ref(false);
const zooming = ref(false);
const movingOffset = ref<{ x: number; y: number }>();
// last object type for which a position was emitted
const currentElementInfo = ref<ElementInfo>();

function activatePanningMode(event: PointerEvent, eventType: SpaceEventTypes) {
  if (
    disablePanning.value === false &&
    panning.value === false &&
    zooming.value === false &&
    eventType === 'move' &&
    currentElementInfo.value?.objectType === 'root'
  ) {
    panning.value = true;
    movingOffset.value = { x: event.clientX, y: event.clientY };
  }
}

function panMap(event: PointerEvent) {
  if (!movingOffset.value) {
    return;
  }
  const point = getSvgPoint(event.clientX, event.clientY);
  const offset = getSvgPoint(movingOffset.value.x, movingOffset.value.y);
  pan(offset.x - point.x, offset.y - point.y);
  movingOffset.value = { x: event.clientX, y: event.clientY };
}

const lastDownPoint = ref<{ x: number; y: number }>();
function moveThreshold(event: PointerEvent, eventType: SpaceEventTypes): boolean {
  if (eventType === 'down' && lastDownPoint.value === undefined) {
    lastDownPoint.value = { x: event.screenX, y: event.screenY };
    return true;
  }
  if (eventType === 'move' && lastDownPoint.value !== undefined) {
    const THRESHOLD = 2;
    const distance = Math.sqrt(
      Math.pow(lastDownPoint.value.x - event.screenX, 2) + Math.pow(lastDownPoint.value.y - event.screenY, 2),
    );
    if (distance <= THRESHOLD) {
      return false;
    }
    lastDownPoint.value = undefined;
  }
  return true;
}

let currentAutoPan: ReturnType<typeof setInterval> | undefined = undefined;
const AUTO_PAN_BORDER = 32;

function autoPan(event: PointerEvent, eventType: SpaceEventTypes): void {
  if (eventType === 'move' && currentElementInfo.value) {
    let dx = 0;
    let dy = 0;
    const boundingRect = svgElement.value?.getBoundingClientRect();
    if (boundingRect) {
      if (event.clientX - AUTO_PAN_BORDER < boundingRect.left) {
        dx = event.clientX - AUTO_PAN_BORDER - boundingRect.left;
      } else if (event.clientX + AUTO_PAN_BORDER > boundingRect.right) {
        dx = event.clientX + AUTO_PAN_BORDER - boundingRect.right;
      }
      if (event.clientY - AUTO_PAN_BORDER < boundingRect.top) {
        dy = event.clientY - AUTO_PAN_BORDER - boundingRect.top;
      } else if (event.clientY + AUTO_PAN_BORDER > boundingRect.bottom) {
        dy = event.clientY + AUTO_PAN_BORDER - boundingRect.bottom;
      }
    }
    if (Math.abs(dx) > 6) {
      dx = Math.sign(dx) * 6;
    }
    if (Math.abs(dy) > 6) {
      dy = Math.sign(dy) * 6;
    }
    if (dx !== 0 || dy !== 0) {
      let { x, y } = getSvgPoint(event.clientX, event.clientY);
      const { objectType, id } = currentElementInfo.value;
      currentAutoPan = setInterval(() => {
        pan(dx, dy);
        x += dx;
        y += dy;
        spaceMapEventEmitter.emit(getEventName(eventType, objectType), id, { x, y });
      }, 10);
    }
  }
}

function emitPosition(event: PointerEvent, eventType: SpaceEventTypes) {
  if (disableControl.value) {
    return;
  }
  if (eventType === 'down') {
    freezeViewBox.value = true;
  }
  if (currentAutoPan) {
    clearInterval(currentAutoPan);
    currentAutoPan = undefined;
  }
  if (event.pointerType === 'mouse' && eventType !== 'up' && event.pressure === 0) {
    return;
  }
  if (!moveThreshold(event, eventType)) {
    return;
  }
  const elementInfo = getSpaceElementInfo(event);
  if (elementInfo === undefined) {
    return;
  }

  activatePanningMode(event, eventType);
  if (panning.value) {
    if (eventType === 'move') {
      panMap(event);
      return;
    }
  } else if (!zooming.value) {
    if (currentElementInfo.value === undefined) {
      currentElementInfo.value = elementInfo;
      (event.target as Element).setPointerCapture(event.pointerId);
    }
    const svgPoint = getSvgPoint(event.clientX, event.clientY);
    spaceMapEventEmitter.emit(
      getEventName(eventType, currentElementInfo.value.objectType),
      currentElementInfo.value.id,
      svgPoint,
    );
    autoPan(event, eventType);
  }
  if (eventType === 'up') {
    currentElementInfo.value = undefined;
    (event.target as Element).releasePointerCapture(event.pointerId);
  }
  panning.value = false;
}

function zoomByMouseWheel(event: WheelEvent) {
  if (disableControl.value) {
    return;
  }
  zoom(event.deltaY * 0.001 * transformMatrix.value.scale, getSvgPoint(event.clientX, event.clientY));
}

const zoomCenter = ref<{ x: number; y: number }>();
const touchCache = ref<TouchList>();

function startZoomByTouch(event: TouchEvent) {
  if (disableControl.value) {
    return;
  }
  if (event.touches.length === 2) {
    touchCache.value = event.touches;
    zooming.value = true;
  }
}

function zoomByTouch(event: TouchEvent) {
  if (disableControl.value) {
    return;
  }
  if (event.touches.length === 2 && touchCache.value) {
    const getTouchDiff = (touches: TouchList): number =>
      Math.sqrt(
        Math.pow(Math.abs(touches[0].clientX - touches[1].clientX), 2) +
          Math.pow(Math.abs(touches[0].clientY - touches[1].clientY), 2),
      );

    const x = event.touches[1].clientX + (event.touches[0].clientX - event.touches[1].clientX) / 2;
    const y = event.touches[1].clientY + (event.touches[0].clientY - event.touches[1].clientY) / 2;

    const ds = 1 - getTouchDiff(event.touches) / getTouchDiff(touchCache.value);
    zoom(ds, getSvgPoint(x, y));

    touchCache.value = event.touches;
  }
}

function endZoomByTouch(event: TouchEvent) {
  if (disableControl.value) {
    return;
  }
  if (event.touches.length < 2 && touchCache.value) {
    touchCache.value = undefined;
    zoomCenter.value = undefined;
    zooming.value = false;
  }
}
</script>
