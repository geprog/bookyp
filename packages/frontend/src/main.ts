import 'windi.css';

import { createApp } from 'vue';

import App from './App.vue';
import { connect as connectFeathers, init as initFeathers } from './compositions/useFeathers';
import i18n from './i18n';
import router from './router';

initFeathers();
connectFeathers();

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');
