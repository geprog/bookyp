import { expect, test } from '@playwright/test';
import { sampleBookable } from '../../scripts/sampleData';

test('Edit and delete an own booking', async ({ page }) => {
  // the booking of the sample data lies in the past, create a fresh one for tomorrow 10:00
  await page.goto('/');
  await page.click('[data-test="button-end"]');
  await page.click(`[data-test="bookable-list-item"]:has-text("${sampleBookable.name}")`);
  await page.fill('[data-test="form-description"]', 'Edit me');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // the date picker of v1 (v-calendar) applies the typed date when the input loses the focus (enter would submit the form)
  const day = `${String(tomorrow.getDate()).padStart(2, '0')}.${String(tomorrow.getMonth() + 1).padStart(2, '0')}.${tomorrow.getFullYear()}`;
  await page.fill('[data-test="form-start"]', `${day} 10:00`);
  await page.press('[data-test="form-start"]', 'Tab');
  await page.fill('[data-test="form-end"]', `${day} 11:00`);
  await page.press('[data-test="form-end"]', 'Tab');
  // the calendar shows the selected range once the typed dates are applied
  await expect(page.locator('.fc-event')).toContainText('10:00 - 11:00');
  await page.click('[data-test="submit-booking"]');
  await expect(page).toHaveURL(/\/account\/bookings$/);

  // open the booking and edit it
  await page.locator('[data-test="booking-item"]', { hasText: '10:00 - 11:00' }).click();
  await expect(page).toHaveURL(/\/account\/booking\/[a-f0-9]+$/);
  await expect(page.locator('[data-test="booking-bookable"]')).toContainText(sampleBookable.name);
  await page.click('[data-test="edit-button"]');
  await expect(page).toHaveURL(/\/booking\/edit\/[a-f0-9]+$/);
  await page.fill('[data-test="form-description"]', 'Edited booking');
  await page.fill('[data-test="form-end"]', `${day} 12:00`);
  await page.press('[data-test="form-end"]', 'Tab');
  await expect(page.locator('.fc-event')).toContainText('10:00 - 12:00');
  await page.click('[data-test="submit-booking"]');
  await expect(page).toHaveURL(/\/account\/booking\/[a-f0-9]+$/);
  await expect(page.locator('main')).toContainText('Edited booking');
  await expect(page.locator('main')).toContainText('12:00');

  // and delete it
  await page.click('[data-test="delete-button"]');
  await page.click('[data-test="dialog-confirm"]');
  await expect(page).toHaveURL(/\/account\/bookings$/);
  await expect(page.locator('[data-test="booking-item"]', { hasText: '10:00 - 12:00' })).toHaveCount(0);
});
