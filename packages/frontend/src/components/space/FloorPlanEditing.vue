<template>
  <template v-for="(path, pathId) in floorPlan">
    <path
      v-if="pathId !== selectedPathId"
      :key="path"
      :d="path"
      class="stroke-black"
      :class="{
        'cursor-pointer': isWall(path) && mode === 'none',
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
    @pointerdown.stop="downOnBubble('start')"
    @pointerup.stop="upOnBubble"
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
    @pointerdown.stop="downOnBubble('end')"
    @pointerup.stop="upOnBubble"
  />
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref, toRef } from 'vue';

import usePointerCapturing from '~/compositions/space/usePointerCapturing';
import { useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { Mode } from '~/views/settings/Space.vue';

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
    const mode = toRef(props, 'mode');
    const floorPlan = toRef(props, 'floorPlan');
    const selectedFloorPlanObjectId = toRef(props, 'selectedFloorPlanObjectId');
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

    function clickOnFloorObject(path: string, pathId: number) {
      if (mode.value !== 'none') {
        return;
      }
      if (isWall(path)) {
        context.emit('selectFloorPlanObject', pathId);
      }
    }

    const selectedPathId = computed(() => newWallId.value || selectedFloorPlanObjectId.value);
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

    // --- move wall
    const moving = ref(false);
    const startEnd = ref('start');

    function downOnBubble(bubble: 'start' | 'end') {
      startEnd.value = bubble;
      moving.value = true;
    }

    const { setCapture, releaseCapture } = usePointerCapturing();

    function upOnBubble() {
      releaseCapture();
      moving.value = false;
      newWallId.value = undefined;
    }

    function moveWallBubble(svgPoint: DOMPoint, event: PointerEvent) {
      if (!moving.value || !selectedPath.value) {
        return;
      }
      setCapture(event);
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

    spaceMap?.on('upInsideSvg', () => {
      if (newWallId.value) {
        upOnBubble();
      }
      context.emit('selectFloorPlanObject', null);
    });
    spaceMap?.on('downInsideSvg', ({ x, y }) => {
      if (mode.value === 'wall') {
        floorPlan.value.push(`M${x} ${y} L${x} ${y}`);
        moving.value = true;
        startEnd.value = 'end';
        newWallId.value = floorPlan.value.length - 1;
      }
    });
    spaceMap?.on('moveInsideSvg', moveWallBubble);

    useAndRegisterViewBox('FloorPlan', toRef(props, 'floorPlan'), { strokeWidth: 2 });
    return {
      isWall,
      selectedPathId,
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
