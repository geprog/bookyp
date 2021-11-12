<template>
  <template v-for="(path, pathId) in floorPlan">
    <path
      v-if="pathId !== selectedPathId"
      :key="path"
      :d="path"
      class="stroke-black"
      :class="{
        'cursor-pointer': isWall(path),
      }"
      stroke-width="2"
      @click.stop="clickOnFloorObject(path, pathId)"
    />
  </template>
  <path v-if="selectedPath" :d="selectedPath" class="stroke-primary-dark" stroke-width="4" />
  <circle
    v-if="wallBubbleStart"
    :cx="wallBubbleStart.x"
    :cy="wallBubbleStart.y"
    r="6"
    stroke="transparent"
    stroke-width="6"
    class="wall-bubble wall-bubble-start fill-primary-dark"
    :class="{
      'cursor-pointer': !moving,
      'cursor-move': moving,
    }"
    @click.stop
    @mousedown.stop="downOnBubble('start')"
    @touchstart.stop="downOnBubble('start')"
    @mouseup.stop="upOnBubble"
    @touchend.stop="upOnBubble"
  />
  <circle
    v-if="wallBubbleEnd"
    :cx="wallBubbleEnd.x"
    :cy="wallBubbleEnd.y"
    r="6"
    stroke="transparent"
    stroke-width="20"
    class="wall-bubble wall-bubble-end fill-primary-dark"
    :class="{
      'cursor-pointer': !moving,
      'cursor-move': moving,
    }"
    @click.stop
    @mousedown.stop="downOnBubble('end')"
    @touchstart.stop="downOnBubble('end')"
    @mouseup.stop="upOnBubble"
    @touchend.stop="upOnBubble"
  />
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref, toRef } from 'vue';

import { useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';

const wallRegex = /^M(?<x>\d+\.?\d*) (?<y>\d+\.?\d*) L(?<x2>\d+\.?\d*) (?<y2>\d+\.?\d*)$/;

type Position = {
  x: number;
  y: number;
};

export default defineComponent({
  name: 'FloorPlanEditing',
  props: {
    floorPlan: {
      type: Array as PropType<string[]>,
      required: true,
    },

    // eslint-disable-next-line vue/no-unused-properties
    selectedFloorPlanObjectId: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectFloorPlanObject: (__floorPlanObjectId: number | null) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:floor-plan': (__floorPlan: string[]) => true,
  },

  setup(props, context) {
    const floorPlan = toRef(props, 'floorPlan');
    const selectedFloorPlanId = toRef(props, 'selectedFloorPlanObjectId');

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

    function isValidPosition(x: number, y: number, x2: number, y2: number) {
      return x >= 0 && y >= 0 && x2 >= 0 && y2 >= 0;
    }

    function createPathFromPositions(x: number, y: number, x2: number, y2: number): string {
      return `M${x} ${y} L${x2} ${y2}`;
    }

    // ---- select wall
    function isWall(path: string) {
      return wallRegex.test(path);
    }

    function clickOnFloorObject(path: string, pathId: number) {
      if (isWall(path)) {
        context.emit('selectFloorPlanObject', pathId);
      }
    }
    const selectedPath = computed<string | null>({
      get() {
        if (!selectedFloorPlanId.value && selectedFloorPlanId.value !== 0) {
          return null;
        }

        return floorPlan.value[selectedFloorPlanId.value];
      },
      set(path) {
        if (!selectedFloorPlanId.value || !path) {
          return;
        }

        const updatedFloorPlan = floorPlan.value;
        updatedFloorPlan[selectedFloorPlanId.value] = path;
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
        if (isValidPosition(x, y, x2, y2)) {
          const path = createPathFromPositions(x, y, x2, y2);
          selectedPath.value = path;
        }
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

    // --- move wall
    const moving = ref(false);
    const startEnd = ref('start');
    const movingOffset = ref({ x: 0, y: 0 });

    function downOnBubble(bubble: 'start' | 'end') {
      startEnd.value = bubble;
      moving.value = true;
    }

    function upOnBubble() {
      moving.value = false;
    }

    function moveWallBubble(svgPoint: DOMPoint) {
      if (!moving.value || !selectedPath.value) {
        return;
      }
      switch (startEnd.value) {
        case 'end':
          wallBubbles.end.value = { x: parseFloat(svgPoint.x.toFixed(5)), y: parseFloat(svgPoint.y.toFixed(5)) };
          break;
        case 'start':
          wallBubbles.start.value = { x: parseFloat(svgPoint.x.toFixed(5)), y: parseFloat(svgPoint.y.toFixed(5)) };
          break;
      }
    }

    const spaceMap = inject(SpaceMapKey);

    spaceMap?.on('clickInsideSvg', () => {
      // reset moving offset to handle other object
      movingOffset.value = { x: 0, y: 0 };
      context.emit('selectFloorPlanObject', null);
    });
    spaceMap?.on('moveInsideSvg', moveWallBubble);

    useAndRegisterViewBox('FloorPlan', toRef(props, 'floorPlan'), { strokeWidth: 2 });
    return {
      isWall,
      selectedPathId: selectedFloorPlanId,
      selectedPath,
      wallBubbleStart: wallBubbles.start,
      wallBubbleEnd: wallBubbles.end,
      downOnBubble,
      upOnBubble,
      clickOnFloorObject,
      moving,
    };
  },
});
</script>
