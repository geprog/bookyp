import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './api/feathers';
import 'windi.css';

createApp(App).use(router).mount('#app');
