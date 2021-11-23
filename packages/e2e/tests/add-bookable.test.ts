import { expect, test } from '@playwright/test';

test('Add a bookable and find it in the settings bookables list', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('button:has-text("Bookables")');
  await page.click('[aria-label="Create bookable"]');
  await page.fill('[data-test="form-name"]', 'Desk 3');
  await page.fill('[data-test="form-description"]', 'Desk with big monitor');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/settings/bookables');
  const body = page.locator('#app > div > div');
  await expect(body).toContainText('Desk 3');
  await expect(body).toContainText('Desk with big monitor');
  expect(await page.screenshot()).toMatchSnapshot('added-bookable.png');
});
