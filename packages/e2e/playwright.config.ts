import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  globalSetup: require.resolve('./global-setup'),
  webServer: process.env.CI
    ? undefined
    : {
        command: 'pnpm run start:e2e',
        port: 3000,
        timeout: 120 * 1000,
        reuseExistingServer: true,
      },
  maxFailures: process.env.CI ? 1 : undefined,
  use: {
    // Tell all tests to load signed-in state from 'storageState.json'.
    storageState: 'storageState.json',
    baseURL: process.env.CI ? process.env.E2E_BASE_URL : 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
};

export default config;
