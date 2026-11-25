<template>
  <svg
    ref="svgElement"
    class="min-h-0 w-full grow touch-none"
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

<script setup lang="ts">
import type { Ref } from 'vue';
import type { SpaceEventType, SpaceMapListener, SpaceObjectType, ViewBox } from '~/utils/spaceMap';
import { spaceMapKey } from '~/utils/spaceMap';

/**
 * An svg canvas that can be panned and zoomed (mouse wheel, pinch) and that distributes
 * pointer events to its layers (floor plan, map objects). The view box is the combination
 * of the view boxes the layers register.
 */
const props = defineProps<{
  /** e.g. while a wall is drawn */
  disablePanning?: boolean;
  /** static preview */
  disableControl?: boolean;
}>();

const freezeViewBox = ref(false);
const svgElement = ref<SVGSVGElement>();
const listeners = new Map<string, SpaceMapListener[]>();
const viewBoxRegistry = new Map<string, Ref<ViewBox>>();
const childViewBoxes = shallowRef<Ref<ViewBox>[]>([]);

const totalViewBox = computed<ViewBox>(() => {
  const box = childViewBoxes.value.map(child => child.value).reduce(combineViewBoxes, EMPTY_VIEW_BOX);
  const result = { ...box };
  if (result.width === 0) {
    result.width = 200;
    result.x -= 100;
  }
  if (result.height === 0) {
    result.height = 200;
    result.y -= 100;
  }
  return result;
});

const cachedViewBox = ref<ViewBox>({ ...totalViewBox.value });
watch(totalViewBox, (value) => {
  if (!freezeViewBox.value) {
    cachedViewBox.value = { ...value };
  }
}, { immediate: true });

const transform = ref({ translateX: 0, translateY: 0, scale: 1 });
const viewBox = computed<ViewBox>(() => {
  const { x, y, width, height } = cachedViewBox.value;
  const { translateX, translateY, scale } = transform.value;
  return { x: x + translateX, y: y + translateY, width: width * scale, height: height * scale };
});

const eventName = (eventType: SpaceEventType, objectType: SpaceObjectType) => `${eventType}|${objectType}`;

function emit(eventType: SpaceEventType, objectType: SpaceObjectType, id: string | null, point: { x: number; y: number }) {
  for (const listener of listeners.get(eventName(eventType, objectType)) ?? []) {
    listener(id, point);
  }
}

provide(spaceMapKey, {
  registerViewBox(key, childViewBox) {
    if (viewBoxRegistry.has(key)) {
      throw new Error(`A view box with key ${key} is already registered`);
    }
    viewBoxRegistry.set(key, childViewBox);
    childViewBoxes.value = [...viewBoxRegistry.values()];
  },
  unregisterViewBox(key) {
    viewBoxRegistry.delete(key);
    childViewBoxes.value = [...viewBoxRegistry.values()];
  },
  on(eventType, objectType, listener) {
    const name = eventName(eventType, objectType);
    listeners.set(name, [...(listeners.get(name) ?? []), listener]);
  },
});

function getSvgPoint(x: number, y: number): { x: number; y: number } {
  if (!svgElement.value) {
    throw new Error('Unable to transform svg point because the svg element is unknown');
  }
  const point = svgElement.value.createSVGPoint();
  point.x = x;
  point.y = y;
  const matrix = svgElement.value.getScreenCTM();
  if (!matrix) {
    throw new Error('Cannot get screen transform matrix');
  }
  const transformed = point.matrixTransform(matrix.inverse());
  return { x: transformed.x, y: transformed.y };
}

interface ElementInfo { objectType: SpaceObjectType; id: string | null }

const objectTypes: SpaceObjectType[] = ['root', 'map-object', 'wall', 'wall-start', 'wall-end'];

function getSpaceElementInfo(event: PointerEvent): ElementInfo | undefined {
  for (const element of event.composedPath() as Element[]) {
    if (typeof element.getAttribute !== 'function') {
      continue;
    }
    const type = element.getAttribute('data-space-element-type') as SpaceObjectType | null;
    if (type && objectTypes.includes(type)) {
      return { objectType: type, id: element.getAttribute('data-space-element-id') };
    }
  }
  return undefined;
}

function pan(dx: number, dy: number) {
  transform.value.translateX += dx;
  transform.value.translateY += dy;
}

function zoom(ds: number, center: { x: number; y: number }) {
  if (transform.value.scale + ds <= 0) {
    return;
  }
  const panFactor = -ds / transform.value.scale;
  pan(panFactor * (center.x - viewBox.value.x), panFactor * (center.y - viewBox.value.y));
  transform.value.scale += ds;
}

const panning = ref(false);
const zooming = ref(false);
const movingOffset = ref<{ x: number; y: number }>();
const currentElementInfo = ref<ElementInfo>();

function activatePanningMode(event: PointerEvent, eventType: SpaceEventType) {
  if (!props.disablePanning && !panning.value && !zooming.value && eventType === 'move' && currentElementInfo.value?.objectType === 'root') {
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

/** ignores tiny movements after a pointer down, so a click does not count as drag */
function moveThreshold(event: PointerEvent, eventType: SpaceEventType): boolean {
  if (eventType === 'down' && lastDownPoint.value === undefined) {
    lastDownPoint.value = { x: event.screenX, y: event.screenY };
    return true;
  }
  if (eventType === 'move' && lastDownPoint.value !== undefined) {
    const distance = Math.hypot(lastDownPoint.value.x - event.screenX, lastDownPoint.value.y - event.screenY);
    if (distance <= 2) {
      return false;
    }
    lastDownPoint.value = undefined;
  }
  return true;
}

let currentAutoPan: ReturnType<typeof setInterval> | undefined;
const AUTO_PAN_BORDER = 32;

/** pans the map automatically when an element is dragged close to the border */
function autoPan(event: PointerEvent, eventType: SpaceEventType): void {
  if (eventType !== 'move' || !currentElementInfo.value) {
    return;
  }
  let dx = 0;
  let dy = 0;
  const rect = svgElement.value?.getBoundingClientRect();
  if (rect) {
    if (event.clientX - AUTO_PAN_BORDER < rect.left) {
      dx = event.clientX - AUTO_PAN_BORDER - rect.left;
    }
    else if (event.clientX + AUTO_PAN_BORDER > rect.right) {
      dx = event.clientX + AUTO_PAN_BORDER - rect.right;
    }
    if (event.clientY - AUTO_PAN_BORDER < rect.top) {
      dy = event.clientY - AUTO_PAN_BORDER - rect.top;
    }
    else if (event.clientY + AUTO_PAN_BORDER > rect.bottom) {
      dy = event.clientY + AUTO_PAN_BORDER - rect.bottom;
    }
  }
  dx = Math.sign(dx) * Math.min(Math.abs(dx), 6);
  dy = Math.sign(dy) * Math.min(Math.abs(dy), 6);
  if (dx !== 0 || dy !== 0) {
    let { x, y } = getSvgPoint(event.clientX, event.clientY);
    const { objectType, id } = currentElementInfo.value;
    currentAutoPan = setInterval(() => {
      pan(dx, dy);
      x += dx;
      y += dy;
      emit(eventType, objectType, id, { x, y });
    }, 10);
  }
}

function emitPosition(event: PointerEvent, eventType: SpaceEventType) {
  if (props.disableControl) {
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
  if (!elementInfo) {
    return;
  }

  activatePanningMode(event, eventType);
  if (panning.value) {
    if (eventType === 'move') {
      panMap(event);
      return;
    }
  }
  else if (!zooming.value) {
    if (currentElementInfo.value === undefined) {
      currentElementInfo.value = elementInfo;
      (event.target as Element).setPointerCapture?.(event.pointerId);
    }
    emit(eventType, currentElementInfo.value.objectType, currentElementInfo.value.id, getSvgPoint(event.clientX, event.clientY));
    autoPan(event, eventType);
  }
  if (eventType === 'up') {
    currentElementInfo.value = undefined;
    (event.target as Element).releasePointerCapture?.(event.pointerId);
  }
  panning.value = false;
}

function zoomByMouseWheel(event: WheelEvent) {
  if (props.disableControl) {
    return;
  }
  zoom(event.deltaY * 0.001 * transform.value.scale, getSvgPoint(event.clientX, event.clientY));
}

const touchCache = ref<TouchList>();

function touchDistance(touches: TouchList): number {
  return Math.hypot(touches[0]!.clientX - touches[1]!.clientX, touches[0]!.clientY - touches[1]!.clientY);
}

function startZoomByTouch(event: TouchEvent) {
  if (!props.disableControl && event.touches.length === 2) {
    touchCache.value = event.touches;
    zooming.value = true;
  }
}

function zoomByTouch(event: TouchEvent) {
  if (props.disableControl || event.touches.length !== 2 || !touchCache.value) {
    return;
  }
  const x = event.touches[1]!.clientX + (event.touches[0]!.clientX - event.touches[1]!.clientX) / 2;
  const y = event.touches[1]!.clientY + (event.touches[0]!.clientY - event.touches[1]!.clientY) / 2;
  zoom(1 - touchDistance(event.touches) / touchDistance(touchCache.value), getSvgPoint(x, y));
  touchCache.value = event.touches;
}

function endZoomByTouch(event: TouchEvent) {
  if (!props.disableControl && event.touches.length < 2 && touchCache.value) {
    touchCache.value = undefined;
    zooming.value = false;
  }
}
</script>
