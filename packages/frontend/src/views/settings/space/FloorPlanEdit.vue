<template>
  <div class="m-4 flex flex-col flex-grow min-h-0">
    <SpaceMap
      data-test="space-map"
      :class="{ 'cursor-pointer': addingStage !== 'not-started' }"
      @down-inside-svg="downInsideFloorPlan"
      @up-inside-svg="upInsideFloorPlan"
      @move-inside-svg="moveInsideFloorPlan"
    >
      <FloorPlanEditing
        v-if="floorPlan"
        :floor-plan="floorPlan"
        :selected-floor-plan-object-id="selectedFloorPlanObjectId"
        @select-floor-plan-object="selectFloorPlanObject"
        @update:floor-plan="updateFloorPlanCopy"
      />
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
        <FloatingButton
          v-if="selectedFloorPlanObjectId !== null"
          data-test="delete-button"
          icon="delete"
          class="ml-2"
          @click="removeSelectedFloorPlanObject"
        />
      </div>
      <slot name="toggleBar" />
    </div>
  </div>
</template>

<script lang="ts">
import { clone, isEqual } from 'lodash';
import { defineComponent, onMounted, Ref, ref, toRef, watch } from 'vue';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import FloorPlanEditing from '~/components/space/FloorPlanEditing.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
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
    saveTrigger: {
      type: Boolean,
      required: true,
    },

    abortTrigger: {
      type: Boolean,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'change-happened': (_flag: boolean) => true,
  },

  setup(props, context) {
    const saveTrigger = toRef(props, 'saveTrigger');
    const abortTrigger = toRef(props, 'abortTrigger');

    const feathers = useFeathers();
    const { currentSpace, isLoading } = useCurrentSpace();

    const floorPlan: Ref<string[]> = ref([]);

    const selectedFloorPlanObjectId: Ref<number | null> = ref(null);

    const useNewFloorPlanObjects = useNewFloorPlanObject(floorPlan);

    function selectFloorPlanObject(objectId: number | null) {
      selectedFloorPlanObjectId.value = objectId;
    }

    onMounted(async () => {
      const loadedCurrentSpace = await waitUntilDataHasBeenLoaded(currentSpace, isLoading);
      if (loadedCurrentSpace.value !== undefined) {
        floorPlan.value = clone(loadedCurrentSpace.value.floorPlan);
      }
    });

    function updateFloorPlanCopy(newFloorPlan: string[]) {
      floorPlan.value = newFloorPlan;
      if (isEqual(floorPlan.value, currentSpace.value?.floorPlan)) {
        context.emit('change-happened', false);
      } else {
        context.emit('change-happened', true);
      }
    }

    watch(saveTrigger, async () => {
      if (currentSpace.value !== undefined) {
        const saveSpace = {
          _id: currentSpace.value?._id,
          floorPlan: floorPlan.value,
          members: currentSpace.value.members,
        };
        await feathers.service('spaces').update(currentSpace.value._id, saveSpace);
      }
      context.emit('change-happened', false);
      selectFloorPlanObject(null);
    });

    watch(abortTrigger, () => {
      if (currentSpace.value !== undefined) {
        floorPlan.value = clone(currentSpace.value.floorPlan);
        selectFloorPlanObject(null);
        context.emit('change-happened', false);
      } else {
        throw new Error('No current space');
      }
    });

    function clickOnAddButton() {
      context.emit('change-happened', true);
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

    function removeSelectedFloorPlanObject() {
      if (selectedFloorPlanObjectId.value !== null) {
        const newFloorPlan = clone(floorPlan.value);
        newFloorPlan.splice(selectedFloorPlanObjectId.value, 1);
        selectedFloorPlanObjectId.value = null;
        floorPlan.value = newFloorPlan;
        context.emit('change-happened', true);
      }
    }

    return {
      clickOnAddButton,
      addingStage: useNewFloorPlanObjects.addingStage,
      downInsideFloorPlan,
      upInsideFloorPlan,
      moveInsideFloorPlan,
      floorPlan,
      updateFloorPlanCopy,
      selectedFloorPlanObjectId,
      selectFloorPlanObject,
      removeSelectedFloorPlanObject,
    };
  },
});
</script>
