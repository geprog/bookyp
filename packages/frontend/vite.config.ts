import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';

const config = defineConfig({
  plugins: [vue(), WindiCSS()],
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
