import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const config = defineConfig({
  plugins: [vue()],
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
