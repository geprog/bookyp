<template>
  <Header :title="t('settings')" has-back>
    <template #second>
      <SettingsTabs />
    </template>
  </Header>
  <div class="mx-4 mt-4">
    <svg class="w-full h-128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path v-for="path in floorPlan" :key="path" :d="path" stroke="#323130" stroke-width="2" />
      <g v-for="mapObject in mapObjects" :key="mapObject" :transform="`translate(${mapObject.xPos},${mapObject.yPos})`">
        <path v-for="path in mapObject.paths" :key="path" :d="path" stroke="#323130" stroke-width="1" />
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/Header.vue';
import SettingsTabs from '~/components/SettingsTabs.vue';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Space',

  components: { Header, SettingsTabs },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const { data: mapObjects } = useFind('mapObjects');

    const { data: spaces } = useFind('spaces');
    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });

    return { t, floorPlan, mapObjects };
  },
});
</script>
