<template>
  <AppContent>
    <div class="flex flex-col gap-16 items-center justify-center w-full h-full">
      <div class="flex flex-col gap-4 items-center w-1/2 shadow-md p-4">
        <h1>{{ t('not_found') }}</h1>
        <p>{{ t('site_not_exist') }}</p>
        <router-link class="w-full" :to="{ name: 'home' }">
          <Button type="button" class="w-full">
            {{ t('back_home') }}
          </Button>
        </router-link>
      </div>
      <img src="/src/assets/img/bookyp-logo-text.svg?url" :alt="t('bookyp_logo')" />
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import AppContent from '~/components/layout/AppContent.vue';

const { t } = useI18n();
</script>
