<template>
  <Header :title="t('settings')" has-back>
    <template #second>
      <SettingsTabs />
    </template>
  </Header>

  <div class="m-4 flex flex-col flex-grow">
    <SpaceMap data-test="space-map">
      <FloorPlan />
      <MapObjects />
    </SpaceMap>

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
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import Header from '~/components/headers/Header.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import SettingsTabs from '~/components/tabs/SettingsTabs.vue';

export default defineComponent({
  name: 'SpaceFloorPlan',

  components: { Header, SettingsTabs, ToggleBar, SpaceMap, FloorPlan, MapObjects },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    return {
      t,
    };
  },
});
</script>
