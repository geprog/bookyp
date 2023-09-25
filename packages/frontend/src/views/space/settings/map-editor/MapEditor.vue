<template>
  <template v-if="$route.name === 'settings-map-select-map-object-type'">
    <router-view
      :selected-map-object-type="selectedMapObjectType"
      @update:selected-map-object-type="updateSelectedMapObjectType"
    />
  </template>

  <template v-else-if="$route.name !== 'settings-space-map' && (isLoadingMapObjects || selectedMapObject)">
    <router-view v-if="selectedMapObject" v-model:map-object="selectedMapObject" />
  </template>

  <template v-else>
    <SettingsHeader :title="t('space_editor')" :changed="changed">
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
          @dblclick-map-object="openMapObjectSettings"
        />
      </SpaceMap>
      <div class="m-auto flex flex-row gap-2 pb-4">
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
          <InfoBox class="h-8">
            {{ t('map_editing.adding_wall_instruction') }}
          </InfoBox>
          <FloatingButton @click.stop="mode = 'none'">
            <Icon name="dismiss" color="text-white" />
            <Icon name="wall" color="text-white" />
          </FloatingButton>
        </template>
        <template v-else>
          <FloatingButton
            icon="table"
            :text="t('map_editing.objects')"
            @click="
              $router.push({ name: 'settings-map-select-map-object-type', params: { spaceId: currentSpace?._id } })
            "
          />
          <FloatingButton icon="wall" :text="t('map_editing.walls')" @click.stop="mode = 'wall'" />

          <input
            ref="floorPlanFileInput"
            type="file"
            class="hidden"
            accept="image/svg+xml"
            @change="uploadFloorPlan($event.target as HTMLInputElement)"
          />
          <FloatingButton icon="svg" :text="t('map_editing.floor_plan')" @click.stop="floorPlanFileInput?.click()" />
        </template>
      </div>
    </div>
  </template>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { onKeyStroke } from '@vueuse/core';
import { clone, cloneDeep, isEqual, omit } from 'lodash';
import { computed, Ref, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import Icon from '~/components/Icon.vue';
import InfoBox from '~/components/InfoBox.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import FloorPlanEditing from '~/components/space/map/FloorPlanEditing.vue';
import MapObjectsEditing from '~/components/space/map/MapObjectsEditing.vue';
import SpaceMap from '~/components/space/map/SpaceMap.vue';
import SaveAbort from '~/components/space/SaveAbort.vue';
import { savedSpaceId, useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import getMapObjects from '~/compositions/space/useMapObjects';
import useNewMapObject, { isNewMapObject, MapObjectType } from '~/compositions/space/useNewMapObject';
import { openDialog } from '~/compositions/useDialog';
import useFeathers from '~/compositions/useFeathers';
import { EditingMapObject } from '~/views/space/settings/space/EditingMapObject';

export type Mode = 'wall' | 'none';

const props = defineProps<{
  selectedMapObjectId?: string;
}>();
const { t } = useI18n();

const changed = ref(false);

const router = useRouter();
const route = useRoute();
const feathers = useFeathers();
const { currentSpace } = useCurrentSpace();

const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

const { data: mapObjects, isLoading: isLoadingMapObjects } = getMapObjects(savedSpaceId);
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

const {
  addMapObject: _addMapObject,
  resetNewMapObjectId,
  selectedMapObjectType,
} = useNewMapObject(mapObjectsCopy, selectMapObject);

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
  if (!(await openDialog({ description: t('confirm_unsaved_changes'), label: t('discard') }))) {
    return false;
  }

  // map objects
  mapObjectsCopy.value = cloneDeep(mapObjects.value);

  // floor plan
  if (currentSpace.value !== undefined) {
    floorPlan.value = clone(currentSpace.value.floorPlan);
  }

  await reset();
  return true;
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

const selectedMapObject = computed({
  get: () => mapObjectsCopy.value.find((mapObject) => mapObject._id === selectedMapObjectId.value),

  set: (mapObject?: EditingMapObject) => {
    if (mapObject === undefined) {
      return;
    }
    const index = mapObjectsCopy.value.findIndex((_mapObject) => _mapObject._id === selectedMapObjectId.value);
    mapObjectsCopy.value[index] = mapObject;
  },
});
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

async function addMapObject() {
  await selectMapObject(null);
  changed.value = true;
  await _addMapObject();
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

const floorPlanFileInput = ref<HTMLInputElement>();

async function uploadFloorPlan(target: HTMLInputElement) {
  if (target.files === null || target.files.length !== 1) {
    return;
  }

  const doc = new DOMParser().parseFromString(await target.files[0].text(), 'image/svg+xml');
  floorPlan.value = Array.from(doc.getElementsByTagName('path'))
    .map((path) => path.getAttribute('d'))
    .filter((d) => d !== null) as string[];

  changed.value = true;
}

async function updateSelectedMapObjectType(_selectedMapObjectType: MapObjectType) {
  selectedMapObjectType.value = _selectedMapObjectType;
  await addMapObject();
}

onBeforeRouteLeave(() => {
  if (changed.value === false) {
    return true;
  }

  return abort();
});

onKeyStroke('Delete', (e) => {
  if (route.name !== 'settings-space-map') {
    return;
  }
  e.preventDefault();
  if (selectedMapObjectId.value !== undefined) {
    void removeSelectedMapObject();
  }
  if (selectedFloorPlanObjectId.value !== null) {
    removeSelectedFloorPlanObject();
  }
});
</script>
