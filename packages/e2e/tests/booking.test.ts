import { SampleModel } from '@bookyp/core';
import { expect, test } from '@playwright/test';

test('Book a bookable and find the booking in the account booking list', async ({ page }) => {
  await page.goto('/');

  await Promise.all([page.waitForNavigation(), page.click('[data-test="button-end"]')]);

  await Promise.all([page.waitForNavigation(), page.click(`text=${SampleModel.sampleBookable.name}`)]);

  await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);

  await page.click('[data-test="button-account"]');

  const body = page.locator(':nth-match([data-test="booking-item"], 1)');
  await expect(body).toContainText(SampleModel.sampleBookable.name);
});
