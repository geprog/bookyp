<template>
  <div class="flex">
    <TabButton :active="$route.name === 'settings-space'" @click="$router.replace({ name: 'settings-space' })">{{
      t('space')
    }}</TabButton>
    <TabButton
      :active="$route.name === 'settings-bookables'"
      @click="$router.replace({ name: 'settings-bookables' })"
      >{{ t('bookables') }}</TabButton
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import TabButton from '~/components/TabButton.vue';

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
