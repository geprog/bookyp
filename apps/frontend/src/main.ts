import { createApp } from 'vue';
import App from './App.vue';
import app from './api/feathers';

createApp(App).mount('#app');

console.log(app);
