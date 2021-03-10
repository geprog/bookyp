import { createI18n } from 'vue-i18n';

// import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
const messages = Object.fromEntries(
  Object.entries(import.meta.globEager('./locales/*.json')).map(([key, value]) => {
    // slice language keys from the glob (filenames without .json)
    return [key.slice(10, -5), value.default];
  }),
);

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages,
});

export default i18n;
