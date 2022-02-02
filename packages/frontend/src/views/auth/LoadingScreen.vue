<template>
  <div class="h-full max-h-xl m-auto flex flex-col">
    <div class="mt-8 flex flex-col items-center">
      <h1 class="text-center text-3xl">{{ t('bookyp').toUpperCase() }}</h1>
      <p class="mt-4 text-center">{{ t('bookyp_name') }}</p>
    </div>

    <div class="flex my-auto justify-center">
      <img class="w-48 h-auto ml-8" src="/src/assets/img/bookyp-logo.svg?url" />
    </div>

    <div class="mb-8 flex justify-center">
      <img class="w-24 h-auto" src="/src/assets/img/geprog-logo.svg?url" />
    </div>
  </div>
</template>

<script lang="ts">
import { getEnvConfig } from '@geprog/vite-plugin-env-config';
import { defineComponent, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LoadingScreen',
  components: {},
  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();

    onMounted(() => {
      window.location.href = `${getEnvConfig('FRONTEND_BACKEND_URL') || ''}/oauth/keycloak?redirect=auth/callback`;
    });

    return { t };
  },
});
</script>
