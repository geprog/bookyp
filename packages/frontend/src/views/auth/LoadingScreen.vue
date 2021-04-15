<template>
  <div>
    <div class="h-screen flex flex-col justify-between">
      <div class="flex-shrink">
        <h1 class="mt-10 text-center text-3xl">{{ t('bookyp').toUpperCase() }}</h1>
        <p class="mt-5 text-center">{{ t('bookyp_name') }}</p>
      </div>
      <div class="flex-shrink">
        <div class="flex justify-center">
          <img src="/src/assets/img/bookyp-logo.svg" />
        </div>
      </div>
      <div class="mb-15 flex-shrink">
        <div class="flex justify-center">
          <img src="/src/assets/img/geprog-logo.svg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import { getConfig } from '~/compositions/useAppConfig';

export default defineComponent({
  name: 'LoadingScreen',
  components: {},
  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();

    onMounted(() => {
      window.location.href = `${getConfig('BACKEND_URL') || ''}/oauth/keycloak?redirect=auth/callback`;
    });

    return { t };
  },
});
</script>
