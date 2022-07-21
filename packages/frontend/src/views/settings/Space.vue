<template>
  <template v-if="$route.name !== 'settings-space-map' && (isLoadingMapObjects || selectedMapObject)">
    <router-view v-if="selectedMapObject" :map-object="selectedMapObject" />
  </template>

  <template v-else>
    <SettingsHeader :title="t('map_editor')">
      <template v-if="changed" #actions>
        <SaveAbort @save="save" @abort="abort" />
      </template>
    </SettingsHeader>

    <div class="flex flex-col flex-grow min-h-0">
      <SpaceMap data-test="space-map" :disable-panning="mode !== 'none'">
        <FloorPlanEditing
          :mode="mode"
          :floor-plan="floorPlan"
          :selected-floor-plan-object-id="selectedFloorPlanObjectId"
          @select-floor-plan-object="selectFloorPlanObject"
          @update:floor-plan="updateFloorPlanCopy"
        />
        <MapObjectsEditing
          :mode="mode"
          :map-objects="mapObjectsCopy"
          :selected-map-object-id="selectedMapObjectId"
          @update:map-objects="updateMapObjectsCopy"
          @select-map-object="selectMapObject"
        />
      </SpaceMap>
      <div class="m-auto flex flex-row gap-2 mb-4">
        <template v-if="isMapObjectSelected">
          <FloatingButton data-test="edit-button" icon="edit" @click="openMapObjectSettings" />
          <FloatingButton data-test="delete-button" icon="delete" @click="removeSelectedMapObject" />
          <FloatingButton
            data-test="rotate-button"
            icon="arrow-clockwise"
            class="mr-2"
            @click="rotateSelectedMapObject"
          />
        </template>
        <FloatingButton
          v-else-if="isFloorPlanObjectSelected"
          data-test="delete-button"
          icon="delete"
          @click="removeSelectedFloorPlanObject"
        />
        <template v-else-if="mode !== 'none'">
          <InfoBox>
            {{ t('map_editing.adding_wall_instruction') }}
          </InfoBox>
          <FloatingButton @click.stop="mode = 'none'">
            <Icon name="dismiss" color="text-white" />
            <Icon name="wall" color="text-white" />
          </FloatingButton>
        </template>
        <template v-else>
          <FloatingButton data-test="add-map-object-button" @click="clickOnAddButton">
            <Icon name="add" color="text-white" />
            <Icon name="table" color="text-white" />
          </FloatingButton>
          <FloatingButton @click.stop="mode = 'wall'">
            <Icon name="add" color="text-white" />
            <Icon name="wall" color="text-white" />
          </FloatingButton>
        </template>
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { clone, cloneDeep, isEqual, omit } from 'lodash';
import { computed, defineComponent, PropType, Ref, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import Icon from '~/components/Icon.vue';
import InfoBox from '~/components/InfoBox.vue';
import FloorPlanEditing from '~/components/space/FloorPlanEditing.vue';
import MapObjectsEditing from '~/components/space/MapObjectsEditing.vue';
import SaveAbort from '~/components/space/SaveAbort.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import getMapObjects from '~/compositions/space/useMapObjects';
import useNewMapObject, { isNewMapObject } from '~/compositions/space/useNewMapObject';
import useFeathers from '~/compositions/useFeathers';

import { EditingMapObject } from './space/EditingMapObject';

export type Mode = 'wall' | 'none';

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
    InfoBox,
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
    const { currentSpace } = useCurrentSpace();

    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    const { data: mapObjects, isLoading: isLoadingMapObjects } = getMapObjects();
    const mapObjectsCopy: Ref<EditingMapObject[]> = ref([]);
    const floorPlan: Ref<string[]> = ref([]);

    const selectedFloorPlanObjectId: Ref<string | null> = ref(null);
    const mode = ref<Mode>('none');

    function updateFloorPlanCopy(newFloorPlan: string[]) {
      floorPlan.value = newFloorPlan;
      if (isEqual(floorPlan.value, currentSpace.value?.floorPlan)) {
        changed.value = false;
      } else {
        changed.value = true;
      }
    }

    watch(
      mapObjects,
      () => {
        mapObjectsCopy.value = cloneDeep(mapObjects.value);
      },
      { immediate: true },
    );

    watch(
      currentSpace,
      () => {
        if (currentSpace.value !== undefined) {
          floorPlan.value = clone(currentSpace.value.floorPlan);
        }
      },
      { immediate: true },
    );

    async function selectMapObject(mapObjectId: string | null) {
      if (mode.value !== 'none') {
        return;
      }
      if (mapObjectId) {
        selectedFloorPlanObjectId.value = null;
        await router.replace({ params: { selectedMapObjectId: mapObjectId } });
      } else {
        await router.replace({ params: { selectedMapObjectId: '' } });
      }
    }

    async function selectFloorPlanObject(floorPlanObjectId: string | null) {
      if (mode.value === 'wall') {
        return;
      }
      selectedFloorPlanObjectId.value = floorPlanObjectId;
      await selectMapObject(null);
    }

    const { addMapObject, resetNewMapObjectId } = useNewMapObject(mapObjectsCopy, selectMapObject);

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
      resetNewMapObjectId();
    }

    async function reset() {
      changed.value = false;
      mode.value = 'none';
      await selectFloorPlanObject(null);
      await selectMapObject(null);
    }

    async function save() {
      // map objects
      await saveMapObjectCopy();

      // floor plan
      if (currentSpace.value !== undefined) {
        await feathers
          .service('spaces')
          .update(currentSpace.value._id, { ...currentSpace.value, floorPlan: floorPlan.value });
      }

      await reset();
    }

    async function abort() {
      // map objects
      mapObjectsCopy.value = cloneDeep(mapObjects.value);

      // floor plan
      if (currentSpace.value !== undefined) {
        floorPlan.value = clone(currentSpace.value.floorPlan);
      }

      await reset();
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

    const selectedMapObject = computed(() =>
      mapObjectsCopy.value.find((mapObject) => mapObject._id === selectedMapObjectId.value),
    );
    const isMapObjectSelected = computed<boolean>(() => !!selectedMapObjectId.value);

    const isFloorPlanObjectSelected = computed<boolean>(() => selectedFloorPlanObjectId.value !== null);

    async function removeSelectedMapObject(): Promise<void> {
      /* istanbul ignore next */
      if (!selectedMapObject.value) {
        return;
      }
      selectedMapObject.value.isDeleted = true;
      await selectMapObject(null);
    }

    async function openMapObjectSettings(): Promise<void> {
      /* istanbul ignore next */
      if (!selectedMapObjectId.value) {
        throw new Error('Unexpected: No map-object selected');
      }

      await router.push({ name: 'settings-map-object', params: { selectedMapObjectId: selectedMapObjectId.value } });
    }

    function rotateSelectedMapObject() {
      /* istanbul ignore next */
      if (!selectedMapObject.value) {
        return;
      }
      selectedMapObject.value.rotation = (selectedMapObject.value.rotation + 90) % 360;
    }

    async function clickOnAddButton() {
      await selectMapObject(null);
      changed.value = true;
      await addMapObject();
    }

    function removeSelectedFloorPlanObject() {
      if (selectedFloorPlanObjectId.value !== null) {
        const newFloorPlan = clone(floorPlan.value);
        newFloorPlan.splice(Number(selectedFloorPlanObjectId.value), 1);
        selectedFloorPlanObjectId.value = null;
        floorPlan.value = newFloorPlan;
        changed.value = true;
      }
    }

    return {
      t,
      changed,
      save,
      abort,
      mode,
      selectedMapObject,
      isMapObjectSelected,
      isFloorPlanObjectSelected,
      mapObjectsCopy,
      selectMapObject,
      clickOnAddButton,
      removeSelectedMapObject,
      openMapObjectSettings,
      rotateSelectedMapObject,
      updateMapObjectsCopy,
      isLoadingMapObjects,
      selectFloorPlanObject,
      updateFloorPlanCopy,
      floorPlan,
      selectedFloorPlanObjectId,
      removeSelectedFloorPlanObject,
    };
  },
});
</script>
