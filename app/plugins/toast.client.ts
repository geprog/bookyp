import Toast, { POSITION } from 'vue-toastification';

/** the toasts of v1 (vue-toastification, top right) */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, { position: POSITION.TOP_RIGHT });
});
