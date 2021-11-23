import { expect, test } from '@playwright/test';

test('Book a bookable and find the booking in the account booking list', async ({ page }) => {
  await page.goto('/');

  await Promise.all([page.waitForNavigation(), page.click('[data-test="button-end"]')]);

  await Promise.all([page.waitForNavigation(), page.click('text=Desk 1')]);

  await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);

  await page.click('[data-test="button-account"]');

  const body = page.locator('[data-test="booking-item"]');
  await expect(body).toContainText('Desk 1');
});
