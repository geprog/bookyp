import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL, storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseURL);
  await page.fill('input[name="username"]', process.env.E2E_AUTH_USERNAME || '');
  await page.fill('input[name="password"]', process.env.E2E_AUTH_PASSWORD || '');
  await page.click('input[type=submit]');
  await page.context().storageState({ path: storageState as string });
  await browser.close();
}

export default globalSetup;
