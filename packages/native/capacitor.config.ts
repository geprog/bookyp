import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.bookyp.app',
  appName: 'BookYP',
  webDir: '../frontend/dist',
  bundledWebRuntime: false,
  server: {
    // url: 'http://localhost:3000',
    // cleartext: true,
  },
  plugins: {
    CapacitorUpdater: {
      updateUrl: 'https://native-app-updater.geprog.com',
    },
  },
  ios: {
    contentInset: 'always',
    scheme: 'Bookyp',
  },
};

export default config;
