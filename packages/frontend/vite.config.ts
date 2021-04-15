import vueI18n from '@intlify/vite-plugin-vue-i18n';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import WindiCSS from 'vite-plugin-windicss';

import viteAppConfig from './vite-plugin-app-config';

const config = defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    vue(),
    WindiCSS(),
    vueI18n({
      include: path.resolve(__dirname, 'src/locales/**'),
    }),
    viteAppConfig(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});

export default config;
