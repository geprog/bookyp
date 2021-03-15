import vueI18n from '@intlify/vite-plugin-vue-i18n';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import WindiCSS from 'vite-plugin-windicss';

const config = defineConfig({
  plugins: [
    vue(),
    WindiCSS(),
    vueI18n({
      include: path.resolve(__dirname, 'src/locales/**'),
    }),
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
  alias: {
    '~': path.resolve(__dirname, 'src'),
  },
});

export default config;
