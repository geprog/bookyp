import { envConfig } from '@geprog/vite-plugin-env-config';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import replace from '@rollup/plugin-replace';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import WindiCSS from 'vite-plugin-windicss';
import svgLoader from 'vite-svg-loader';

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
    envConfig({ variables: ['FRONTEND_BACKEND_URL'] }),
    // Fix due to a hard coded Object.defineProperty(...) statement in the feathers dist code
    // See also Issue at rollup: https://github.com/rollup/rollup/issues/2332
    // TODO: Remove workaround if issue with feathers got resolved
    replace({
      'Object.defineProperty(exports, "__esModule", { value: true });':
        'Object.defineProperty(exports || {}, "__esModule", { value: true });',
      delimiters: ['\n', '\n'],
      preventAssignment: true,
    }),
    VitePWA({
      includeAssets: ['favicon.ico', 'favicon.svg'],
      manifest: {
        name: 'BOOKYP - Book your place easily',
        short_name: 'BOOKYP',
        description: 'Book your place easily',
        display: 'standalone',
        theme_color: '#f59e0b',
        background_color: '#ffffff',
        icons: [
          {
            src: './pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: './pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: './favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  server: {
    hmr: {
      clientPort: process.env.FRONTEND_BACKEND_URL !== 'http://localhost:4000' ? 443 : undefined,
    },
  },
});

export default config;
