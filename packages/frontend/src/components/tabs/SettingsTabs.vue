<template>
  <div class="flex">
    <TabButton
      :active="$route.name === 'settings-space' || $route.name === 'settings-space-floor-plan'"
      @click="$router.replace({ name: 'settings-space' })"
    >
      <span>{{ t('space') }}</span>
    </TabButton>
    <TabButton :active="$route.name === 'settings-bookables'" @click="$router.replace({ name: 'settings-bookables' })">
      <span>{{ t('bookables') }}</span>
    </TabButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import TabButton from '~/components/tabs/TabButton.vue';

export default defineComponent({
  name: 'SettingsTabs',

  components: { TabButton },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    return { t };
  },
});
</script>
