<template>
  <header class="fixed top-0 z-10 flex h-14 w-full justify-center bg-white shadow-md">
    <div class="flex h-full w-full max-w-5xl items-center justify-between p-2" :class="{ 'justify-end': header.back === false || !header.title }">
      <div class="flex basis-full items-center">
        <IconButton
          v-if="header.back !== false"
          data-test="back-button"
          icon="dismiss"
          :disabled="header.backDisabled"
          :label="t('back')"
          @click="header.back && back(header.back)"
        />
        <span v-if="header.title" class="line-clamp-1" data-test="header-title">{{ header.title }}</span>
      </div>
      <NuxtLink to="/spaces" class="flex h-8 w-auto shrink-0 cursor-pointer justify-center" :aria-label="t('bookyp_logo')">
        <img src="~/assets/img/bookyp-logo-text.svg" alt="" class="h-8 w-auto">
      </NuxtLink>
      <!-- like in v1 the actions container only exists when a page provides actions, otherwise the logo moves to the right -->
      <div id="app-header-actions" class="flex basis-full items-center justify-end space-x-2 empty:hidden" :class="{ 'max-md:hidden': header.actionsDesktopOnly }" />
    </div>
  </header>
  <div class="h-14 w-full shrink-0" />
</template>

<script setup lang="ts">
const { t } = useI18n();
const { header } = useAppHeader();
const { back } = useBack();
</script>
