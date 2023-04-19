<template>
  <footer
    class="fixed bottom-0 h-14 bg-white border-t-1 w-full flex gap-4 justify-around shadow text-gray-600 md:hidden"
  >
    <router-link :to="{ name: 'spaces-list' }" class="flex flex-col flex-grow items-center py-1.5 px-4">
      <Icon name="magnifying-glass" />
      <span class="text-sm">{{ t('explore') }}</span>
    </router-link>
    <router-link :to="{ name: 'account-bookings' }" class="flex flex-col flex-grow items-center py-1.5 px-4">
      <Icon name="ticket" />
      <span class="text-sm">{{ t('bookings') }}</span>
    </router-link>
    <router-link :to="{ name: 'account' }" class="flex flex-col flex-grow items-center py-1.5 px-4">
      <Icon name="three-horizontal-dots" />
      <span class="text-sm">{{ t('more') }}</span>
    </router-link>
  </footer>
  <div class="w-full h-14 flex-shrink-0" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Icon from '~/components/Icon.vue';

const { t } = useI18n();
</script>

<style scoped>
:deep(.router-link-exact-active) {
  @apply text-primary-normal;
}
</style>
