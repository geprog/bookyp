<template>
  <AppContent class="flex-col px-4! max-md:pt-12">
    <RadioOption :name="t('languages.english')" :selected="locale === 'en'" @select="setLocale('en')" />
    <RadioOption :name="t('languages.deutsch')" :selected="locale === 'de'" @select="setLocale('de')" />
  </AppContent>
</template>

<script setup lang="ts">
const { t, locale, setLocale } = useI18n();
useAppHeader(() => ({ menu: 'none', title: t('language'), back: '/account' }));
</script>
