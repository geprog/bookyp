<template>
  <div class="m-4 flex flex-col flex-grow min-h-0">
    <SpaceMap
      data-test="space-map"
      :class="{ 'cursor-pointer': addingStage !== 'not-started' }"
      @down-inside-svg="downInsideFloorPlan"
      @up-inside-svg="upInsideFloorPlan"
      @move-inside-svg="moveInsideFloorPlan"
    >
      <FloorPlanEditing v-if="floorPlan" v-model:floor-plan="floorPlan" />
      <MapObjects />
    </SpaceMap>
    <div class="flex flex-row">
      <div class="mr-auto flex flex-row">
        <FloatingButton
          v-if="addingStage === 'not-started'"
          data-test="add-button"
          icon="add-circle"
          @click.stop="clickOnAddButton"
        />
      </div>
      <slot name="toggleBar" />
    </div>
  </div>
</template>

<script lang="ts">
import clone from 'lodash/clone';
import { defineComponent, onMounted, Ref, ref, toRef, watch } from 'vue';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import FloorPlanEditing from '~/components/space/FloorPlanEditing.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import getCurrentSpace from '~/compositions/space/useCurrentSpace';
import useNewFloorPlanObject from '~/compositions/space/useNewFloorPlanObject';
import useFeathers from '~/compositions/useFeathers';
import { waitUntilDataHasBeenLoaded } from '~/utils';

export default defineComponent({
  name: 'FloorPlanEdit',
  components: {
    SpaceMap,
    FloorPlanEditing,
    MapObjects,
    FloatingButton,
  },

  props: {
    // eslint-disable-next-line vue/no-unused-properties
    saveTrigger: {
      type: Boolean,
      required: true,
    },

    // eslint-disable-next-line vue/no-unused-properties
    abortTrigger: {
      type: Boolean,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'change-happend': (_flag: boolean) => true,
  },

  setup(props, context) {
    const saveTrigger = toRef(props, 'saveTrigger');
    const abortTrigger = toRef(props, 'abortTrigger');

    const feathers = useFeathers();
    const { data: currentSpace, isLoading } = getCurrentSpace();
    const floorPlan: Ref<string[]> = ref([]);

    const useNewFloorPlanObjects = useNewFloorPlanObject(floorPlan);

    onMounted(async () => {
      const loadedCurrentSpace = await waitUntilDataHasBeenLoaded(currentSpace, isLoading);
      if (loadedCurrentSpace.value !== undefined) {
        floorPlan.value = clone(loadedCurrentSpace.value.floorPlan);
      }
    });

    watch(saveTrigger, async () => {
      if (currentSpace.value !== undefined) {
        const saveSpace = {
          _id: currentSpace.value?._id,
          floorPlan: floorPlan.value,
        };
        await feathers.service('spaces').update(currentSpace.value._id, saveSpace);
      }
      context.emit('change-happend', false);
    });

    watch(abortTrigger, () => {
      if (currentSpace.value !== undefined) {
        floorPlan.value = clone(currentSpace.value.floorPlan);
        context.emit('change-happend', false);
      } else {
        throw new Error('No current space');
      }
    });

    function clickOnAddButton() {
      context.emit('change-happend', true);
      useNewFloorPlanObjects.startAddingWall();
    }

    function downInsideFloorPlan(svgP: DOMPoint) {
      useNewFloorPlanObjects.addFirstPositionOfWall(svgP);
    }

    function upInsideFloorPlan() {
      useNewFloorPlanObjects.finishAddingOfWall();
    }

    function moveInsideFloorPlan(svgP: DOMPoint) {
      useNewFloorPlanObjects.updateSecondPositionOfWall(svgP);
    }

    return {
      clickOnAddButton,
      addingStage: useNewFloorPlanObjects.addingStage,
      downInsideFloorPlan,
      upInsideFloorPlan,
      moveInsideFloorPlan,
      floorPlan,
    };
  },
});
</script>
