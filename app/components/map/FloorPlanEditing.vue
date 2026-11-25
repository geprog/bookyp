<template>
  <template v-for="(path, index) in floorPlan" :key="`${index}-${path}`">
    <path
      v-if="index !== selectedIndex"
      :d="path"
      :data-space-element-type="isWall(path) ? 'wall' : undefined"
      :data-space-element-id="String(index)"
      class="stroke-black"
      :class="{ 'cursor-pointer': isWall(path) && mode === 'none' }"
      stroke-width="2"
    />
  </template>
  <path
    v-if="selectedPath"
    :d="selectedPath"
    :data-space-element-type="isWall(selectedPath) ? 'wall' : undefined"
    :data-space-element-id="String(selectedIndex)"
    class="stroke-amber-600"
    :class="{ 'cursor-pointer': !moving && isWall(selectedPath) && mode === 'none', 'cursor-move': moving }"
    stroke-width="2"
  />
  <circle
    v-if="wallStart"
    :cx="wallStart.x"
    :cy="wallStart.y"
    r="6"
    stroke="transparent"
    stroke-width="20"
    data-space-element-type="wall-start"
    :data-space-element-id="String(selectedIndex)"
    class="fill-amber-600"
    :class="moving ? 'cursor-move' : 'cursor-pointer'"
  />
  <circle
    v-if="wallEnd"
    :cx="wallEnd.x"
    :cy="wallEnd.y"
    r="6"
    stroke="transparent"
    stroke-width="20"
    data-space-element-type="wall-end"
    :data-space-element-id="String(selectedIndex)"
    class="fill-amber-600"
    :class="moving ? 'cursor-move' : 'cursor-pointer'"
  />
</template>

<script setup lang="ts">
import { spaceMapKey } from '~/utils/spaceMap';

export type EditorMode = 'wall' | 'none';

/**
 * Editable floor plan: walls (simple `M x y L x2 y2` paths) can be selected, moved,
 * stretched at their ends and new walls can be drawn in `wall` mode.
 */
const props = defineProps<{
  mode: EditorMode;
  floorPlan: string[];
  selectedFloorPlanObjectId: string | null;
}>();

const emit = defineEmits<{
  'selectFloorPlanObject': [id: string | null];
  'update:floorPlan': [floorPlan: string[]];
}>();

const wallRegex = /^M(?<x>-?\d+(?:\.\d*)?) (?<y>-?\d+(?:\.\d*)?)\s*L(?<x2>-?\d+(?:\.\d*)?) (?<y2>-?\d+(?:\.\d*)?)$/;

interface Position { x: number; y: number }

const moving = ref(false);
const newWallIndex = ref<number>();

function isWall(path: string): boolean {
  return wallRegex.test(path);
}

function parseWall(path: string): [number, number, number, number] | undefined {
  const groups = wallRegex.exec(path)?.groups;
  if (!groups) {
    return undefined;
  }
  return [Number.parseFloat(groups.x!), Number.parseFloat(groups.y!), Number.parseFloat(groups.x2!), Number.parseFloat(groups.y2!)];
}

const selectedIndex = computed(() => newWallIndex.value ?? (props.selectedFloorPlanObjectId !== null ? Number(props.selectedFloorPlanObjectId) : null));

const selectedPath = computed(() => (selectedIndex.value === null ? null : props.floorPlan[selectedIndex.value] ?? null));

function updateSelectedPath(path: string) {
  if (selectedIndex.value === null) {
    return;
  }
  const updated = [...props.floorPlan];
  updated[selectedIndex.value] = path;
  emit('update:floorPlan', updated);
}

const selectedWall = computed(() => (selectedPath.value ? parseWall(selectedPath.value) : undefined));

const wallStart = computed<Position | null>(() => (selectedWall.value ? { x: selectedWall.value[0], y: selectedWall.value[1] } : null));
const wallEnd = computed<Position | null>(() => (selectedWall.value ? { x: selectedWall.value[2], y: selectedWall.value[3] } : null));

function setWall(start: Position, end: Position) {
  updateSelectedPath(`M${start.x} ${start.y} L${end.x} ${end.y}`);
}

const round = (point: Position): Position => ({ x: Number.parseFloat(point.x.toFixed(5)), y: Number.parseFloat(point.y.toFixed(5)) });

const spaceMap = inject(spaceMapKey);
const previousPoint = ref<Position>();

spaceMap?.on('up', 'wall', (id) => {
  if (props.mode !== 'none') {
    return;
  }
  if (props.selectedFloorPlanObjectId !== id) {
    emit('selectFloorPlanObject', id);
  }
  moving.value = false;
  previousPoint.value = undefined;
});

spaceMap?.on('move', 'wall', (id, svgPoint) => {
  if (props.mode !== 'none') {
    return;
  }
  moving.value = true;
  if (props.selectedFloorPlanObjectId !== id) {
    emit('selectFloorPlanObject', id);
    return;
  }
  const point = round(svgPoint);
  previousPoint.value ??= point;
  if (wallStart.value && wallEnd.value) {
    const dx = point.x - previousPoint.value.x;
    const dy = point.y - previousPoint.value.y;
    setWall({ x: wallStart.value.x + dx, y: wallStart.value.y + dy }, { x: wallEnd.value.x + dx, y: wallEnd.value.y + dy });
  }
  previousPoint.value = point;
});

spaceMap?.on('up', 'root', () => {
  if (props.mode === 'none') {
    emit('selectFloorPlanObject', null);
  }
  if (props.mode === 'wall' && newWallIndex.value !== undefined) {
    newWallIndex.value = undefined;
  }
});

spaceMap?.on('move', 'wall-start', (_id, svgPoint) => {
  moving.value = true;
  if (wallEnd.value) {
    setWall(round(svgPoint), wallEnd.value);
  }
});

spaceMap?.on('move', 'wall-end', (_id, svgPoint) => {
  moving.value = true;
  if (wallStart.value) {
    setWall(wallStart.value, round(svgPoint));
  }
});

spaceMap?.on('up', 'wall-start', () => (moving.value = false));
spaceMap?.on('up', 'wall-end', () => (moving.value = false));

spaceMap?.on('move', 'root', (_id, svgPoint) => {
  if (props.mode !== 'wall') {
    return;
  }
  const { x, y } = round(svgPoint);
  if (newWallIndex.value === undefined) {
    emit('update:floorPlan', [...props.floorPlan, `M${x} ${y} L${x} ${y}`]);
    newWallIndex.value = props.floorPlan.length;
  }
  else if (wallStart.value) {
    setWall(wallStart.value, { x, y });
  }
});

useAndRegisterViewBox('FloorPlan', toRef(props, 'floorPlan'), { strokeWidth: 2 });
</script>
