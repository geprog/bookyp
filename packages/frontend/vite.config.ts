import { envConfig } from '@geprog/vite-plugin-env-config';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import replace from '@rollup/plugin-replace';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import WindiCSS from 'vite-plugin-windicss';
import svgLoader from 'vite-svg-loader';
import { defineConfig } from 'vitest/config';

const config = defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '$/': `${path.resolve(__dirname, 'test')}/`,
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith(`md-`) || tag === 'markdown-toolbar',
        },
      },
    }),
    WindiCSS(),
    svgLoader({
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
        ],
      },
    }),
    vueI18n({
      include: path.resolve(__dirname, 'src/locales/**'),
    }),
    envConfig({ variables: ['FRONTEND_BACKEND_URL', 'NODE_ENV', 'ENVIRONMENT_TYPE'] }),
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
            src: './pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: './pwa-maskable-512x512.png',
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
    port: parseInt(process.env.FRONTEND_PORT || '3000'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    onConsoleLog: (log, type) => {
      if (type === 'stderr') {
        throw new Error(`Unexpected call to console.warn or console.error: ${log}`);
      }
    },
    setupFiles: path.resolve(__dirname, 'test/setup.ts'),
  },
});

export default config;
