import { chromium, FullConfig } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';

import { credentials } from './credentials';
import { seed } from './seed';

dotenvConfig({ path: path.join(__dirname, '.env') });
dotenvConfig({ path: path.join(__dirname, '..', '..', '.env') });

async function globalSetup(config: FullConfig): Promise<void> {
  await seed();

  const { baseURL, storageState } = config.projects[0].use;
  if (!baseURL) {
    throw new Error('baseURL is not set');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseURL);
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('input[type=submit]');
  await page.waitForNavigation();
  await page.click('[data-test="space-item"] >> nth=0');
  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

export default globalSetup;
