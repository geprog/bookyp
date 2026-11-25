<template>
  <AppContent>
    <div class="flex size-full flex-col items-center justify-center gap-16">
      <div class="flex w-full max-w-sm flex-col items-center gap-4 rounded-md border border-gray-200 p-4 shadow-md md:w-1/2">
        <h1 class="text-xl">
          {{ t('not_found') }}
        </h1>
        <p>{{ t('site_not_exist') }}</p>
        <AppButton to="/" class="w-full">
          {{ t('back_home') }}
        </AppButton>
      </div>
      <img src="~/assets/img/bookyp-logo-text.svg" :alt="t('bookyp_logo')" class="w-80">
    </div>
  </AppContent>
</template>

<script setup lang="ts">
definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
useAppHeader(() => ({ hidden: true, menu: 'none', title: t('not_found') }));
</script>
