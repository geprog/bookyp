import 'windi.css';
import '~/assets/styles.css';
// eslint-disable-next-line no-restricted-imports
import 'vue-toastification/dist/index.css';
import '@fontsource/roboto';

import { App as CapacitorApp } from '@capacitor/app';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { createApp } from 'vue';
import Toast, { POSITION } from 'vue-toastification';

import App from '~/App.vue';
import { connect as connectFeathers, init as initFeathers, reconnect } from '~/compositions/useFeathers';
import i18n from '~/i18n';
import router from '~/router';

initFeathers();
connectFeathers();
dayjs.extend(duration);

const app = createApp(App);
void CapacitorUpdater.notifyAppReady();

app.use(router);
app.use(i18n);
app.mount('#app');
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
});

void CapacitorApp.addListener('appStateChange', (state) => {
  if (state.isActive) {
    reconnect();
  }
});
