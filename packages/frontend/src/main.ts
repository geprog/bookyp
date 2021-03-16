import 'windi.css';

import { createApp } from 'vue';

import App from './App.vue';
import { connect } from './compositions/useFeathers';
import i18n from './i18n';
import router from './router';

connect();

const app = createApp(App);

app.use(router);
app.use(i18n);
app.mount('#app');
