<template>
  <div class="m-4 flex flex-col flex-grow min-h-0">
    <SpaceMap data-test="space-map">
      <FloorPlan />
      <MapObjectsEditing
        :map-objects="mapObjectsCopy"
        :selected-map-object-id="selectedMapObjectId"
        @update:map-objects="updateMapObjectsCopy"
        @select-map-object="selectMapObject"
      />
    </SpaceMap>

    <div class="flex flex-row">
      <div class="mr-auto flex flex-row">
        <FloatingButton data-test="add-button" icon="table" class="mr-2" @click="clickOnAddButton" />
        <template v-if="isSelected">
          <FloatingButton
            v-if="!isNewMapObjectPresent"
            data-test="edit-button"
            icon="edit"
            class="mr-2"
            @click="openMapObjectSettings"
          />
          <FloatingButton data-test="delete-button" icon="delete" class="mr-2" @click="removeSelectedMapObject" />
        </template>
      </div>
      <slot class="ml-auto" name="toggleBar" />
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { cloneDeep, isEqual, omit } from 'lodash';
import { computed, defineComponent, onMounted, PropType, Ref, ref, toRef, watch } from 'vue';
import { useRouter } from 'vue-router';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjectsEditing from '~/components/space/MapObjectsEditing.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import getMapObjects from '~/compositions/space/useMapObjects';
import useNewMapObject, { isNewMapObject } from '~/compositions/space/useNewMapObject';
import useFeathers from '~/compositions/useFeathers';
import { waitUntilDataHasBeenLoaded } from '~/utils';

import { EditingMapObject } from './EditingMapObject';

export default defineComponent({
  name: 'MapObjectsEdit',

  components: {
    SpaceMap,
    FloorPlan,
    FloatingButton,
    MapObjectsEditing,
  },

  props: {
    selectedMapObjectId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },

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
    const router = useRouter();
    const feathers = useFeathers();

    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');
    const saveTrigger = toRef(props, 'saveTrigger');
    const abortTrigger = toRef(props, 'abortTrigger');

    const { data: mapObjects, isLoading } = getMapObjects();
    const mapObjectsCopy: Ref<EditingMapObject[]> = ref([]);
    onMounted(async () => {
      const loadedMapObjects = await waitUntilDataHasBeenLoaded(mapObjects, isLoading);
      mapObjectsCopy.value = cloneDeep(loadedMapObjects.value);
    });

    async function selectMapObject(mapObject: Model.MapObject | null) {
      if (mapObject) {
        await router.replace({ params: { selectedMapObjectId: mapObject._id } });
      } else {
        await router.replace({ params: { selectedMapObjectId: '' } });
      }
    }

    const { addMapObject, resetNewMapObjectId, isNewMapObjectPresent } = useNewMapObject(
      mapObjectsCopy,
      selectMapObject,
    );

    async function saveMapObjectCopy() {
      // update all map objects as we do not know which one changed
      for (const mapObject of mapObjectsCopy.value) {
        if (isNewMapObject(mapObject) && !mapObject.isDeleted) {
          await feathers.service('mapObjects').create(omit(mapObject, '_id'));
        } else if (mapObject.isDeleted && !isNewMapObject(mapObject)) {
          await feathers.service('mapObjects').remove(mapObject._id);
        } else if (!mapObject.isDeleted) {
          await feathers.service('mapObjects').update(mapObject._id, mapObject);
        }
      }
      mapObjectsCopy.value = cloneDeep(mapObjects.value);
      resetNewMapObjectId();
    }

    watch(saveTrigger, async () => {
      await saveMapObjectCopy();
      await selectMapObject(null);
      context.emit('change-happened', false);
      await selectMapObject(null);
    });

    watch(abortTrigger, async () => {
      mapObjectsCopy.value = cloneDeep(mapObjects.value);
      context.emit('change-happened', false);
      await selectMapObject(null);
    });

    function updateMapObjectsCopy(updateValue: Ref<Model.MapObject[]>) {
      mapObjectsCopy.value = cloneDeep(updateValue.value);
    }

    watch(
      mapObjectsCopy,
      () => {
        if (isEqual(mapObjectsCopy.value, mapObjects.value)) {
          context.emit('change-happened', false);
        } else {
          context.emit('change-happened', true);
        }
      },
      { deep: true },
    );

    // flag to show if we are currently editing a map object
    const isSelected = computed<boolean>(() => {
      if (selectedMapObjectId.value) {
        return true;
      }
      return false;
    });

    async function removeSelectedMapObject(): Promise<void> {
      /* istanbul ignore next */
      if (!selectedMapObjectId.value) {
        return;
      }
      mapObjectsCopy.value.forEach((mapObject) => {
        if (mapObject._id === selectedMapObjectId.value) {
          mapObject.isDeleted = true;
        }
      });
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
      context.emit('change-happened', true);
      addMapObject();
    }

    return {
      isSelected,
      mapObjectsCopy,
      selectMapObject,
      clickOnAddButton,
      removeSelectedMapObject,
      openMapObjectSettings,
      updateMapObjectsCopy,
      isNewMapObjectPresent,
    };
  },
});
</script>
