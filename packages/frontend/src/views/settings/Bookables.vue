<template>
  <Header :title="t('settings')" has-back />
  <div class="bookables">
    <FloatingButton
      class="fixed bottom-8 right-8"
      icon-name="add"
      @click="router.replace({ name: 'settings-bookable' })"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FloatingButton from '~/components/FloatingButton.vue';
import Header from '~/components/Header.vue';

export default defineComponent({
  name: 'Bookables',
  components: {
    FloatingButton,
    Header,
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    return { router, t };
  },
});
</script>
