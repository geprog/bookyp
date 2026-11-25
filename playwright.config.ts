import process from 'node:process';
import { defineConfig } from '@playwright/test';

const port = Number.parseInt(process.env.E2E_PORT || '3010');
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${port}`;

/**
 * The tests run against a production build of the app on port 3010 with the dummy login
 * (see the `e2e:server` script). Set E2E_BASE_URL to test a running instance.
 */
export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : [['list']],
  testMatch: '**/*.test.ts',
  timeout: 60_000,
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm e2e:server`,
        url: `${baseURL}/api/me`,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
        env: { NUXT_PUBLIC_APP_URL: baseURL, PORT: String(port), NUXT_AUTH_HANDLER: 'dummy' },
      },
  use: {
    baseURL,
    storageState: 'e2e/.auth/storageState.json',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'Europe/Berlin',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
});
