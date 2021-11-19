import vueI18n from '@intlify/vite-plugin-vue-i18n';
import replace from '@rollup/plugin-replace';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import WindiCSS from 'vite-plugin-windicss';
import svgLoader from 'vite-svg-loader';

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
    svgLoader(),
    vueI18n({
      include: path.resolve(__dirname, 'src/locales/**'),
    }),
    viteAppConfig(),
    // Fix due to a hard coded Object.defineProperty(...) statement in the feathers dist code
    // See also Issue at rollup: https://github.com/rollup/rollup/issues/2332
    // TODO: Remove workaround if issue with feathers got resolved
    replace({
      'Object.defineProperty(exports, "__esModule", { value: true });':
        'Object.defineProperty(exports || {}, "__esModule", { value: true });',
      delimiters: ['\n', '\n'],
      preventAssignment: true,
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
});

export default config;
