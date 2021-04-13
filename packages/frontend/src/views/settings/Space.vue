<template>
  <Header :title="t('settings')" has-back>
    <template #second>
      <SettingsTabs />
    </template>
  </Header>
  <div class="mx-4 mt-4">
    <svg class="w-full h-128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path v-for="path in floorPlan" :key="path" :d="path" stroke="#323130" stroke-width="2" />
    </svg>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/Header.vue';
import SettingsTabs from '~/components/SettingsTabs.vue';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Space',

  components: { Header, SettingsTabs },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const feathers = useFeathers();
    const { data: spaces } = useFind('spaces');

    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });

    onMounted(async () => {
      // TODO: remove seed when editor exists
      let { length } = (await feathers.service('spaces').find({})) as Model.Space[];
      if (length) {
        await feathers.service('spaces').create({
          floorPlan: [
            'M288 325H30.2315V226.738H1V1H288V325Z',
            'M1 1.96375V44.2787H43.5143C43.4181 20.8928 24.4229 1.96428 1 1.96375Z',
          ],
        });
      }
    });

    return { t, floorPlan };
  },
});
</script>
