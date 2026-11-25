/**
 * v1 stored the chosen language in localStorage (`bookyp.locale`), v2 uses the cookie of @nuxtjs/i18n.
 * The old choice is taken over once, so users keep their language after the switch to v2.
 */
export default defineNuxtPlugin({
  name: 'legacy-locale',
  dependsOn: ['i18n:plugin'],
  async setup(nuxtApp) {
    const legacy = localStorage.getItem('bookyp.locale');
    if (legacy === null) {
      return;
    }
    localStorage.removeItem('bookyp.locale');
    if (legacy === 'de' || legacy === 'en') {
      await nuxtApp.$i18n.setLocale(legacy);
    }
  },
});
