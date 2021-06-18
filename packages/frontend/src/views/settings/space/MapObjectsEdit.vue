<template>
  <div class="m-4 flex flex-col flex-grow">
    <SpaceMap data-test="space-map" @click-inside-svg="clickInsideFloorPlan">
      <FloorPlan />
      <MapObjects
        :selected-map-object-id="selectedMapObjectId"
        :clickable="mode === 'viewing' || mode === 'editing'"
        @click-on-map-object="selectMapObject"
      />
      <NewMapObject v-if="newMapObject" :new-map-object="newMapObject" />
    </SpaceMap>

    <div class="flex flex-row">
      <div class="mr-auto flex flex-row">
        <FloatingButton v-if="mode === 'viewing'" data-test="add-button" icon="table" @click="clickOnAddButton" />
        <FloatingButton
          v-if="mode === 'editing'"
          data-test="abort-button"
          icon="cross"
          class="mr-2"
          @click="selectMapObject(null)"
        />
        <template v-if="mode === 'editing'">
          <FloatingButton data-test="edit-button" icon="edit" class="mr-2" @click="openMapObjectSettings" />
          <FloatingButton data-test="delete-button" icon="delete" class="mr-2" @click="removeSelectedMapObject" />
        </template>
      </div>
      <slot class="ml-auto" name="toggleBar" />
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, PropType, toRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import NewMapObject from '~/components/space/NewMapObject.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import useNewMapObject from '~/compositions/space/useNewMapObject';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'MapObjectsEdit',

  components: {
    SpaceMap,
    FloorPlan,
    NewMapObject,
    FloatingButton,
    MapObjects,
  },

  props: {
    selectedMapObjectId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },

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
    const router = useRouter();
    const route = useRoute();
    const feathers = useFeathers();

    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');
    const saveTrigger = toRef(props, 'saveTrigger');
    const abortTrigger = toRef(props, 'abortTrigger');

    const { newMapObject, addMapObject, saveNewMapObject, positionNewMapObject } = useNewMapObject();

    watch(saveTrigger, async () => {
      await saveNewMapObject();
      context.emit('change-happend', false);
    });

    watch(abortTrigger, () => {
      newMapObject.value = null;
      context.emit('change-happend', false);
    });

    // flag to show if we are currently editing the map
    const mode = computed<'creating' | 'editing' | 'viewing'>(() => {
      if (newMapObject.value) {
        return 'creating';
      }

      if (selectedMapObjectId.value) {
        return 'editing';
      }
      return 'viewing';
    });

    function clickInsideFloorPlan(svgP: { x: number; y: number }) {
      // skip if we are not currently in creating mode
      if (mode.value !== 'creating') {
        return;
      }
      positionNewMapObject(svgP);
    }

    async function selectMapObject(mapObject: Model.MapObject | null) {
      // only allow selection of a mapObject if currently not in creating mode and when editing mapObjects
      if (mode.value === 'creating') {
        return;
      }

      const params = mapObject ? { selectedMapObjectId: mapObject._id } : undefined;

      /* istanbul ignore next */
      if (!route.name) {
        throw new Error('Can not detect current route');
      }

      await router.replace({ name: route.name, params });
    }

    async function removeSelectedMapObject(): Promise<void> {
      /* istanbul ignore next */
      if (!selectedMapObjectId.value) {
        return;
      }
      await feathers.service('mapObjects').remove(selectedMapObjectId.value);
      await selectMapObject(null);
    }

    async function openMapObjectSettings(): Promise<void> {
      /* istanbul ignore next */
      if (!selectedMapObjectId.value) {
        throw new Error('Unexpected: No map-object selected');
      }

      await router.push({ name: 'settings-map-object', params: { mapObjectId: selectedMapObjectId.value } });
    }

    async function clickOnAddButton() {
      await selectMapObject(null);
      context.emit('change-happend', true);
      addMapObject();
    }

    return {
      mode,
      clickInsideFloorPlan,
      selectMapObject,
      newMapObject,
      clickOnAddButton,
      removeSelectedMapObject,
      openMapObjectSettings,
    };
  },
});
</script>
