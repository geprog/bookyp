import { expect, test } from '@playwright/test';
import { sampleBookable, sampleBookableSecond } from '../../scripts/sampleData';

test('Book a bookable and find the booking in the account booking list', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-end"]');
  await expect(page).toHaveURL(/\/bookables\/list$/);
  await page.click(`[data-test="bookable-list-item"]:has-text("${sampleBookable.name}")`);
  await expect(page).toHaveURL(/\/booking$/);
  await page.click('[data-test="submit-booking"]');
  await expect(page).toHaveURL(/\/account\/bookings$/);
  await expect(page.locator('[data-test="booking-item"]').first()).toContainText(sampleBookable.name);
});

test('A booking request has to be accepted by an admin', async ({ page }) => {
  // switch the space to requests
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-bookings-and-requests"]');
  // the mode is saved by a request, wait for it before leaving the page
  await Promise.all([
    page.waitForResponse(response => response.request().method() === 'PATCH' && response.url().includes('/api/spaces/')),
    page.click('[data-test="mode-requests"]'),
  ]);
  await page.goto('/');
  await page.click('[data-test="button-end"]');
  await page.click(`[data-test="bookable-list-item"]:has-text("${sampleBookableSecond.name}")`);
  await page.click('[data-test="submit-booking"]');
  await expect(page).toHaveURL(/\/account\/bookings$/);
  const requestedItem = page.locator('[data-test="booking-item"]', { hasText: sampleBookableSecond.name });
  await expect(requestedItem).toContainText('Requested');

  // accept it as admin
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-pending-requests"]');
  await expect(page.locator('[data-test="request-item"]')).toHaveCount(1);
  await page.click('[data-test="accept-request"]');
  await expect(page.locator('[data-test="accept-request"]')).toHaveCount(0);
  await page.goto('/account/bookings');
  await expect(page.locator('[data-test="booking-item"]', { hasText: sampleBookableSecond.name })).not.toContainText('Requested');
});
