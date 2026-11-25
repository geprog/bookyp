<template>
  <template v-if="$pwa?.needRefresh">
    <!-- overlay -->
    <div class="fixed inset-0 z-500 bg-gray-900 opacity-80 print:hidden" />
    <div class="fixed inset-0 z-1000 m-4 flex flex-col items-center justify-center print:hidden" role="alert" data-test="update-app">
      <div class="rounded-sm border border-gray-200 bg-gray-200 p-4 shadow-xl">
        <div class="mb-2 text-xl">
          <span>{{ t('app.new_version') }}</span>
        </div>
        <div class="flex w-full flex-row justify-center gap-x-4">
          <AppButton :text="t('app.install')" @click="$pwa.updateServiceWorker(true)" />
          <AppButton :text="t('app.cancel')" @click="$pwa.cancelPrompt()" />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
/** asks to reload the app when a new version was deployed (v1 `UpdateApp`) */
const { t } = useI18n();
</script>
