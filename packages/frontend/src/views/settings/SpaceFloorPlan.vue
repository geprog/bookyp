<template>
  <Header :title="t('settings')" has-back>
    <template #second>
      <SettingsTabs />
    </template>
  </Header>

  <div class="m-4 flex flex-col flex-grow">
    <svg class="w-full flex-grow" xmlns="http://www.w3.org/2000/svg" data-test="space-map" fill="none">
      <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-gray-active" stroke-width="2" />
      <g
        v-for="mapObject in mapObjects"
        :key="mapObject._id"
        data-test="map-object"
        :transform="`translate(${mapObject.xPos},${mapObject.yPos})`"
      >
        <path v-for="path in mapObject.paths" :key="path" :d="path" class="stroke-black fill-white" />
      </g>
    </svg>

    <div class="mt-auto ml-auto flex flex-row">
      <ToggleBar
        selected="end"
        start-icon="table"
        end-icon="floor-plan"
        @selected-start="$router.replace({ name: 'settings-space' })"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import Header from '~/components/headers/Header.vue';
import SettingsTabs from '~/components/tabs/SettingsTabs.vue';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'SpaceFloorPlan',

  components: { Header, SettingsTabs, ToggleBar },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();

    const { data: spaces } = useFind('spaces');
    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });

    const { data: mapObjects } = useFind('mapObjects');

    return {
      t,
      floorPlan,
      mapObjects,
    };
  },
});
</script>
