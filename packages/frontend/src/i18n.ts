import { useStorage } from '@vueuse/core';
import { watch } from 'vue';
import { createI18n } from 'vue-i18n';

import messages from '~/locales';

const browserLocale = navigator.language.split('-')[0];
export const userLanguage = useStorage('bookyp.locale', browserLocale);

const i18n = createI18n({
  legacy: false,
  locale: userLanguage.value,
  fallbackLocale: 'en',
  messages,
});

watch(userLanguage, () => {
  i18n.global.locale.value = userLanguage.value as 'de' | 'en';
});

export default i18n;
