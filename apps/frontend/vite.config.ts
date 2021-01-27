import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const config = defineConfig({
  plugins: [vue()],
  logLevel: 'info',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['@feathersjs/*', 'socket.io-client'],
  },
});

export default config;
