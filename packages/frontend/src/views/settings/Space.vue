<template>
  <Header :title="t('settings')" has-back>
    <IconButton v-if="mode === 'viewing'" data-test="add-button" icon="table" @click="addMapObject" />
    <IconButton v-if="mode === 'editing'" data-test="abort-button" icon="cross" @click="selectMapObject(null)" />
    <template v-if="mode === 'creating'">
      <IconButton data-test="abort-button" icon="cross" @click="newMapObject = null" />
      <IconButton data-test="save-button" type="submit" icon="check-mark" @click="saveNewMapObject" />
    </template>

    <template #second>
      <SettingsTabs />
    </template>
  </Header>

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
    <div class="mt-auto ml-auto flex flex-row">
      <FloatingButton
        v-if="mode === 'editing'"
        data-test="delete-button"
        type="submit"
        icon="delete"
        class="mr-4"
        @click="removeSelectedMapObject"
      />

      <ToggleBar
        v-if="mode === 'viewing'"
        start-icon="table"
        end-icon="floor-plan"
        @selected-end="$router.replace({ name: 'settings-space-floor-plan' })"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, PropType, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import ToggleBar from '~/components/buttons/ToggleBar.vue';
import Header from '~/components/headers/Header.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import NewMapObject from '~/components/space/NewMapObject.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import SettingsTabs from '~/components/tabs/SettingsTabs.vue';
import useNewMapObject from '~/compositions/space/useNewMapObject';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'Space',

  components: {
    FloorPlan,
    FloatingButton,
    IconButton,
    Header,
    SettingsTabs,
    MapObjects,
    NewMapObject,
    SpaceMap,
    ToggleBar,
  },

  props: {
    selectedMapObjectId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },

  setup(props) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();
    const route = useRoute();

    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    const { newMapObject, addMapObject, saveNewMapObject, positionNewMapObject } = useNewMapObject();

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
      // only allow selection of a mapObject if currently not in creating mode
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

    return {
      t,
      mode,
      addMapObject,
      newMapObject,
      clickInsideFloorPlan,
      saveNewMapObject,
      selectMapObject,
      removeSelectedMapObject,
    };
  },
});
</script>
