<template>
  <!-- overlay -->
  <div v-if="needRefresh" class="fixed bg-gray-900 opacity-80 left-0 top-0 right-0 bottom-0 z-500 print:hidden" />
  <!-- overlay end -->
  <div
    v-if="needRefresh"
    class="fixed top-0 left-0 right-0 bottom-0 m-4 flex flex-col items-center justify-center z-1000 print:hidden"
    role="alert"
  >
    <div class="rounded-sm p-4 bg-gray-200 border-1 border-gray-200 shadow-xl">
      <div class="mb-2 text-xl">
        <span>{{ t('app.new_version') }}</span>
      </div>

      <div class="flex flex-row w-full gap-x-4 justify-center">
        <Button type="button" @click="updateServiceWorker(true)">{{ t('app.install') }}</Button>
        <Button type="button" @click="close">{{ t('app.cancel') }}</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';

const { needRefresh, updateServiceWorker } = useRegisterSW();

const { t } = useI18n();

function close() {
  needRefresh.value = false;
}
</script>
