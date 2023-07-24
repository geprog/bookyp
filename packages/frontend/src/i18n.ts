import { useStorage } from '@vueuse/core';
import { createI18n } from 'vue-i18n';

import messages from '~/locales';

function getUserLanguage(): string {
  const browserLocale = navigator.language.split('-')[0];
  const selectedLocale = useStorage('bookyp.locale', browserLocale).value;

  return selectedLocale;
}

const i18n = createI18n({
  legacy: false,
  locale: getUserLanguage(),
  fallbackLocale: 'en',
  messages,
});

export default i18n;
