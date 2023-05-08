<template>
  <template v-for="(path, pathId) in floorPlan">
    <path
      v-if="pathId !== selectedPathId"
      :key="path"
      :d="path"
      :data-space-element-type="isWall(path) ? 'wall' : undefined"
      :data-space-element-id="pathId"
      class="stroke-black"
      :class="{
        'cursor-pointer': isWall(path) && mode === 'none',
      }"
      stroke-width="2"
    />
  </template>
  <path
    v-if="selectedPath"
    :d="selectedPath"
    :data-space-element-type="isWall(selectedPath) ? 'wall' : undefined"
    :data-space-element-id="selectedPathId"
    class="stroke-primary-dark"
    :class="{
      'cursor-pointer': !moving && isWall(selectedPath) && mode === 'none',
      'cursor-move': moving,
    }"
    stroke-width="2"
  />
  <circle
    v-if="wallBubbleStart"
    :cx="wallBubbleStart.x"
    :cy="wallBubbleStart.y"
    r="6"
    stroke="transparent"
    stroke-width="20"
    data-space-element-type="wall-start"
    :data-space-element-id="selectedPathId"
    class="fill-primary-dark"
    :class="{
      'cursor-pointer': !moving,
      'cursor-move': moving,
    }"
  />
  <circle
    v-if="wallBubbleEnd"
    :cx="wallBubbleEnd.x"
    :cy="wallBubbleEnd.y"
    r="6"
    stroke="transparent"
    stroke-width="20"
    data-space-element-type="wall-end"
    :data-space-element-id="selectedPathId"
    class="fill-primary-dark"
    :class="{
      'cursor-pointer': !moving,
      'cursor-move': moving,
    }"
  />
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref, toRef } from 'vue';

import { useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { Mode } from '~/views/space/settings/map-editor/MapEditor.vue';

const wallRegex = /^M(?<x>-?\d+\.?\d*) (?<y>-?\d+\.?\d*)\s*L(?<x2>-?\d+\.?\d*) (?<y2>-?\d+\.?\d*)$/;

type Position = {
  x: number;
  y: number;
};

export default defineComponent({
  name: 'FloorPlanEditing',
  props: {
    mode: {
      type: String as PropType<Mode>,
      required: true,
    },

    floorPlan: {
      type: Array as PropType<string[]>,
      required: true,
    },

    selectedFloorPlanObjectId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectFloorPlanObject: (__id: string | null) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:floor-plan': (__floorPlan: string[]) => true,
  },

  setup(props, context) {
    const mode = toRef(props, 'mode');
    const floorPlan = toRef(props, 'floorPlan');
    const selectedFloorPlanObjectId = toRef(props, 'selectedFloorPlanObjectId');

    const moving = ref(false);
    const newWallId = ref<number>();

    function getPositionsFromPath(path: string): [x: number, y: number, x2: number, y2: number] | undefined {
      const matches = wallRegex.exec(path);

      if (!matches || !matches.groups) {
        return;
      }

      const x = parseFloat(matches.groups.x);
      const y = parseFloat(matches.groups.y);
      const x2 = parseFloat(matches.groups.x2);
      const y2 = parseFloat(matches.groups.y2);
      return [x, y, x2, y2];
    }

    function createPathFromPositions(x: number, y: number, x2: number, y2: number): string {
      return `M${x} ${y} L${x2} ${y2}`;
    }

    // ---- select wall
    function isWall(path: string) {
      return wallRegex.test(path);
    }

    const selectedPathId = computed(
      () => newWallId.value || (selectedFloorPlanObjectId.value ? Number(selectedFloorPlanObjectId.value) : null),
    );

    const selectedPath = computed<string | null>({
      get() {
        if (selectedPathId.value === null) {
          return null;
        }

        return floorPlan.value[selectedPathId.value];
      },
      set(path) {
        if (selectedPathId.value === null || !path) {
          return;
        }

        const updatedFloorPlan = floorPlan.value;
        updatedFloorPlan[selectedPathId.value] = path;
        context.emit('update:floor-plan', updatedFloorPlan);
      },
    });

    // ---- Bubbles
    const selectedPathPositions = computed<[x: number, y: number, x2: number, y2: number] | undefined | null>({
      get() {
        if (!selectedPath.value) {
          return null;
        }

        return getPositionsFromPath(selectedPath.value);
      },
      set(args) {
        if (!args) {
          selectedPath.value = null;
          return;
        }

        const [x, y, x2, y2] = args;
        selectedPath.value = createPathFromPositions(x, y, x2, y2);
      },
    });

    const wallBubbles = {
      start: computed<Position | null>({
        get() {
          if (!selectedPathPositions.value) {
            return null;
          }

          return {
            x: selectedPathPositions.value[0],
            y: selectedPathPositions.value[1],
          };
        },
        set(value) {
          if (!value || !selectedPathPositions.value) {
            return;
          }

          const [, , x2, y2] = selectedPathPositions.value;
          const { x, y } = value;
          selectedPathPositions.value = [x, y, x2, y2];
        },
      }),

      end: computed<Position | null>({
        get() {
          if (!selectedPathPositions.value) {
            return null;
          }

          return {
            x: selectedPathPositions.value[2],
            y: selectedPathPositions.value[3],
          };
        },
        set(value) {
          if (!value || !selectedPathPositions.value) {
            return;
          }

          const [x, y, ,] = selectedPathPositions.value;
          const { x: x2, y: y2 } = value;
          selectedPathPositions.value = [x, y, x2, y2];
        },
      }),
    };

    function normalizeDOMPoint(svgPoint: DOMPoint): { x: number; y: number } {
      return { x: parseFloat(svgPoint.x.toFixed(5)), y: parseFloat(svgPoint.y.toFixed(5)) };
    }

    const spaceMap = inject(SpaceMapKey);

    const previousPoint = ref<{ x: number; y: number }>();

    spaceMap?.on('up', 'wall', (id) => {
      // select wall when clicked on one
      if (mode.value !== 'none') {
        return;
      }
      if (selectedFloorPlanObjectId.value !== id) {
        context.emit('selectFloorPlanObject', id);
      }
      moving.value = false;
      previousPoint.value = undefined;
    });

    spaceMap?.on('move', 'wall', (id, svgPoint) => {
      if (mode.value !== 'none') {
        return;
      }
      // move whole wall
      moving.value = true;
      if (selectedFloorPlanObjectId.value !== id) {
        context.emit('selectFloorPlanObject', id);
      }
      if (previousPoint.value === undefined) {
        previousPoint.value = normalizeDOMPoint(svgPoint);
      }
      const { x: prevX, y: prevY } = previousPoint.value;
      const { x, y } = normalizeDOMPoint(svgPoint);
      if (wallBubbles.start.value) {
        wallBubbles.start.value = {
          x: wallBubbles.start.value.x + x - prevX,
          y: wallBubbles.start.value.y + y - prevY,
        };
      }
      if (wallBubbles.end.value) {
        wallBubbles.end.value = {
          x: wallBubbles.end.value.x + x - prevX,
          y: wallBubbles.end.value.y + y - prevY,
        };
      }
      previousPoint.value = { x, y };
    });

    spaceMap?.on('up', 'root', () => {
      // unselect wall when clicking on nothing
      if (mode.value !== 'none') {
        return;
      }
      context.emit('selectFloorPlanObject', null);
    });

    // move wall via its bubble points
    spaceMap?.on('move', 'wall-start', (id, svgPoint) => {
      moving.value = true;
      wallBubbles.start.value = normalizeDOMPoint(svgPoint);
    });
    spaceMap?.on('move', 'wall-end', (id, svgPoint) => {
      moving.value = true;
      wallBubbles.end.value = normalizeDOMPoint(svgPoint);
    });

    // stop moving detected
    spaceMap?.on('up', 'wall-start', () => {
      moving.value = false;
    });
    spaceMap?.on('up', 'wall-end', () => {
      moving.value = false;
    });

    spaceMap?.on('move', 'root', (id, svgPoint) => {
      if (mode.value === 'wall') {
        // add new wall when moving on empty area
        const { x, y } = normalizeDOMPoint(svgPoint);
        if (newWallId.value === undefined) {
          floorPlan.value.push(`M${x} ${y} L${x} ${y}`);
          newWallId.value = floorPlan.value.length - 1;
        } else {
          wallBubbles.end.value = { x, y };
        }
      }
    });

    spaceMap?.on('up', 'root', () => {
      if (mode.value === 'wall' && newWallId.value !== undefined) {
        // finish new wall when moving on empty area
        newWallId.value = undefined;
      }
    });

    useAndRegisterViewBox('FloorPlan', toRef(props, 'floorPlan'), { strokeWidth: 2 });
    return {
      isWall,
      selectedPathId,
      selectedPath,
      wallBubbleStart: wallBubbles.start,
      wallBubbleEnd: wallBubbles.end,
      moving,
    };
  },
});
</script>
