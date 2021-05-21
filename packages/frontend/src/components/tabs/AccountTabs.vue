<template>
  <div class="flex">
    <TabButton :active="$route.name === 'account-bookings'" @click="$router.replace({ name: 'account-bookings' })">
      <span>{{ t('bookings') }}</span>
    </TabButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import TabButton from '~/components/tabs/TabButton.vue';

export default defineComponent({
  name: 'AccountTabs',

  components: { TabButton },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    return { t };
  },
});
</script>
