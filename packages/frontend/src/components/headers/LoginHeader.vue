<template>
  <header class="z-10 fixed top-0 bg-white w-full h-14 shadow-md flex justify-center">
    <div class="w-full h-full max-w-5xl">
      <div class="flex h-full items-center p-2 content-center">
        <IconButton icon="close" div @click="$router.replace({ name: 'spaces-list' })" />
        <h1 class="mr-auto font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
          {{ t('login') }}
        </h1>
        <div class="flex space-x-2">
          <img src="/src/assets/img/bookyp-new-logo.svg?url" />
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';

const { t } = useI18n();
</script>
