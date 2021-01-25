import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';

// these eslint disables due to @vitejs/plugin-vue is not listing vite as a dependency
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const vueObject: Plugin = vue();

export default defineConfig({
  plugins: [vueObject],
});
