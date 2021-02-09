import { createApp } from 'vue';
import App from './App.vue';
import app from './api/feathers';
import './assets/index.css';

createApp(App).mount('#app');

console.log(app);
