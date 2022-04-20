<template>
  <SettingsHeader :title="t('map_editor')">
    <template v-if="changed" #actions>
      <SaveAbort @save="save" @abort="abort" />
    </template>
  </SettingsHeader>

  <div class="m-4 flex flex-col flex-grow min-h-0">
    <SpaceMap
      data-test="space-map"
      @down-inside-svg="addFirstPositionOfWall"
      @up-inside-svg="finishAddingOfWall"
      @move-inside-svg="updateSecondPositionOfWall"
    >
      <FloorPlanEditing
        v-if="floorPlan"
        :floor-plan="floorPlan"
        :selected-floor-plan-object-id="selectedFloorPlanObjectId"
        @select-floor-plan-object="selectFloorPlanObject"
        @update:floor-plan="updateFloorPlanCopy"
      />
      <MapObjectsEditing
        :map-objects="mapObjectsCopy"
        :selected-map-object-id="selectedMapObjectId"
        @update:map-objects="updateMapObjectsCopy"
        @select-map-object="selectMapObject"
      />
    </SpaceMap>

    <div class="m-auto flex flex-row gap-2">
      <template v-if="isMapObjectSelected">
        <FloatingButton
          v-if="!isNewMapObjectPresent"
          data-test="edit-button"
          icon="edit"
          @click="openMapObjectSettings"
        />
        <FloatingButton data-test="delete-button" icon="delete" @click="removeSelectedMapObject" />
      </template>
      <FloatingButton
        v-else-if="isFloorPlanObjectSelected"
        data-test="delete-button"
        icon="delete"
        @click="removeSelectedFloorPlanObject"
      />
      <template v-else>
        <FloatingButton v-if="isAddingWall" @click.stop="cancelAddingWall">
          <Icon name="dismiss" color="text-white" />
          <Icon name="wall" color="text-white" />
        </FloatingButton>
        <template v-else>
          <FloatingButton data-test="add-button" @click="clickOnAddButton">
            <Icon name="add" color="text-white" />
            <Icon name="table" color="text-white" />
          </FloatingButton>
          <FloatingButton @click.stop="addFloorPlanObject">
            <Icon name="add" color="text-white" />
            <Icon name="wall" color="text-white" />
          </FloatingButton>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { clone, cloneDeep, isEqual, omit } from 'lodash';
import { computed, defineComponent, onMounted, PropType, Ref, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import Icon from '~/components/Icon.vue';
import FloorPlanEditing from '~/components/space/FloorPlanEditing.vue';
import MapObjectsEditing from '~/components/space/MapObjectsEditing.vue';
import SaveAbort from '~/components/space/SaveAbort.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import getMapObjects from '~/compositions/space/useMapObjects';
import useNewFloorPlanObject from '~/compositions/space/useNewFloorPlanObject';
import useNewMapObject, { isNewMapObject } from '~/compositions/space/useNewMapObject';
import useFeathers from '~/compositions/useFeathers';
import { waitUntilDataHasBeenLoaded } from '~/utils';

import { EditingMapObject } from './space/EditingMapObject';

export default defineComponent({
  name: 'Space',

  components: {
    SaveAbort,
    SpaceMap,
    FloatingButton,
    MapObjectsEditing,
    FloorPlanEditing,
    SettingsHeader,
    Icon,
  },

  props: {
    selectedMapObjectId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },

  setup(props) {
    const { t } = useI18n();

    const changed = ref(false);

    const router = useRouter();
    const feathers = useFeathers();
    const { currentSpace, isLoading: isLoadingSpace } = useCurrentSpace();

    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    const { data: mapObjects, isLoading: isLoadingMapObjects } = getMapObjects();
    const mapObjectsCopy: Ref<EditingMapObject[]> = ref([]);
    const floorPlan: Ref<string[]> = ref([]);

    const selectedFloorPlanObjectId: Ref<number | null> = ref(null);
    const {
      isAddingWall,
      cancelAddingWall,
      finishAddingOfWall,
      startAddingWall,
      updateSecondPositionOfWall,
      addFirstPositionOfWall,
    } = useNewFloorPlanObject(floorPlan);

    function updateFloorPlanCopy(newFloorPlan: string[]) {
      floorPlan.value = newFloorPlan;
      if (isEqual(floorPlan.value, currentSpace.value?.floorPlan)) {
        changed.value = false;
      } else {
        changed.value = true;
      }
    }

    onMounted(async () => {
      const loadedMapObjects = await waitUntilDataHasBeenLoaded(mapObjects, isLoadingMapObjects);
      mapObjectsCopy.value = cloneDeep(loadedMapObjects.value);
      const loadedCurrentSpace = await waitUntilDataHasBeenLoaded(currentSpace, isLoadingSpace);
      if (loadedCurrentSpace.value !== undefined) {
        floorPlan.value = clone(loadedCurrentSpace.value.floorPlan);
      }
    });

    async function selectMapObject(mapObject: Model.MapObject | null) {
      if (isAddingWall.value) {
        return;
      }
      if (mapObject) {
        selectedFloorPlanObjectId.value = null;
        await router.replace({ params: { selectedMapObjectId: mapObject._id } });
      } else {
        await router.replace({ params: { selectedMapObjectId: '' } });
      }
    }

    async function selectFloorPlanObject(objectId: number | null) {
      selectedFloorPlanObjectId.value = objectId;
      await selectMapObject(null);
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

    async function save() {
      // map objects
      await saveMapObjectCopy();
      await selectMapObject(null);
      changed.value = false;
      await selectMapObject(null);

      // floor plan
      if (currentSpace.value !== undefined) {
        await feathers
          .service('spaces')
          .update(currentSpace.value._id, { ...currentSpace.value, floorPlan: floorPlan.value });
      }
      changed.value = false;
      await selectFloorPlanObject(null);
    }

    async function abort() {
      // map objects
      mapObjectsCopy.value = cloneDeep(mapObjects.value);
      changed.value = false;
      await selectMapObject(null);

      // floor plan
      if (currentSpace.value !== undefined) {
        floorPlan.value = clone(currentSpace.value.floorPlan);
        await selectFloorPlanObject(null);
        changed.value = false;
      } else {
        throw new Error('No current space');
      }
    }
    function updateMapObjectsCopy(updateValue: Ref<Model.MapObject[]>) {
      mapObjectsCopy.value = cloneDeep(updateValue.value);
    }

    watch(
      mapObjectsCopy,
      () => {
        if (isEqual(mapObjectsCopy.value, mapObjects.value)) {
          changed.value = false;
        } else {
          changed.value = true;
        }
      },
      { deep: true },
    );

    const isMapObjectSelected = computed<boolean>(() => !!selectedMapObjectId.value);

    const isFloorPlanObjectSelected = computed<boolean>(() => selectedFloorPlanObjectId.value !== null);

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
      changed.value = true;
      await addMapObject();
    }

    function removeSelectedFloorPlanObject() {
      if (selectedFloorPlanObjectId.value !== null) {
        const newFloorPlan = clone(floorPlan.value);
        newFloorPlan.splice(selectedFloorPlanObjectId.value, 1);
        selectedFloorPlanObjectId.value = null;
        floorPlan.value = newFloorPlan;
        changed.value = true;
      }
    }

    function addFloorPlanObject() {
      changed.value = true;
      startAddingWall();
    }

    return {
      t,
      changed,
      save,
      abort,
      isAddingWall,
      isMapObjectSelected,
      isFloorPlanObjectSelected,
      mapObjectsCopy,
      selectMapObject,
      clickOnAddButton,
      removeSelectedMapObject,
      openMapObjectSettings,
      updateMapObjectsCopy,
      isNewMapObjectPresent,
      selectFloorPlanObject,
      updateFloorPlanCopy,
      floorPlan,
      selectedFloorPlanObjectId,
      removeSelectedFloorPlanObject,
      addFloorPlanObject,
      cancelAddingWall,
      addFirstPositionOfWall,
      finishAddingOfWall,
      updateSecondPositionOfWall,
    };
  },
});
</script>
