<template>
  <Header :title="t('language')" :back-fallback="{ name: 'account' }" />

  <AppContent class="!px-4 flex-col <md:pt-12">
    <RadioButton :name="t('languages.english')" :value="userLanguage === 'en'" @update-value="userLanguage = 'en'" />
    <RadioButton :name="t('languages.deutsch')" :value="userLanguage === 'de'" @update-value="userLanguage = 'de'" />
  </AppContent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import RadioButton from '~/components/RadioButton.vue';
import { userLanguage } from '~/i18n';

const { t } = useI18n();
</script>
