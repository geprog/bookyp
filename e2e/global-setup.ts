import type { FullConfig } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { config as dotenv } from 'dotenv';
import { credentials } from './credentials';
import { seed } from './seed';

dotenv({ path: path.join(import.meta.dirname, '..', '.env') });

/** seeds the database and logs in once, the tests reuse the stored session */
async function globalSetup(config: FullConfig): Promise<void> {
  await seed();

  const project = config.projects[0];
  const baseURL = project?.use.baseURL;
  const storageState = project?.use.storageState;
  if (!baseURL || typeof storageState !== 'string') {
    throw new Error('baseURL and storageState must be configured');
  }
  mkdirSync(path.dirname(storageState), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseURL}/auth/login`);
  await page.click('[data-test="login-button"]');
  await page.waitForSelector('input[name="username"]');
  await page.fill('input[name="username"]', credentials.username);
  await page.click('input[type=submit]');
  await page.waitForURL(`${baseURL}/**`);
  // opening a space remembers it as the current space (the start page then redirects to it)
  await page.goto(`${baseURL}/spaces`);
  await page.click('[data-test="space-item"] >> nth=0');
  await page.waitForURL(/\/bookables\/map$/);
  await page.context().storageState({ path: storageState });
  await browser.close();
}

export default globalSetup;
