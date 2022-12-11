import 'windi.css';
import '~/assets/styles.css';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { createApp } from 'vue';

import App from '~/App.vue';
import { connect as connectFeathers, init as initFeathers } from '~/compositions/useFeathers';
import i18n from '~/i18n';
import router from '~/router';

initFeathers();
connectFeathers();
dayjs.extend(duration);

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');
