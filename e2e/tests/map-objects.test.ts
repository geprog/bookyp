import { expect, test } from '@playwright/test';
import { sampleBookableThird } from '../../scripts/sampleData';

test('My booked map object is highlighted on the map', async ({ page }) => {
  // create a space
  await page.goto('/space/create');
  await page.fill('[data-test="form-name"]', 'E2E Space for booking highlight testing');
  await page.click('[data-test="create-space-button"]');
  await expect(page).toHaveURL(/\/settings\/space\/edit$/);
  await page.click('[data-test="save-space-button"]');
  await expect(page).toHaveURL(/\/settings\/info$/);

  // create a bookable
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-bookables"]');
  await page.click('[data-test="button-add-bookable"]');
  await page.fill('[data-test="form-name"]', sampleBookableThird.name);
  await page.fill('[data-test="form-description"]', sampleBookableThird.description);
  await page.click('[data-test="submit-bookable"]');
  await expect(page).toHaveURL(/\/settings\/bookable$/);

  // create a map object linked to the bookable
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-map-objects"]');
  await page.click('[data-test="add-map-object-button"]');
  await page.click('[data-test="map-object-type-table"]');
  await page.click('[data-test="edit-button"]');
  await page.click('[data-test="link-to-bookable-button"]');
  await page.click('[data-test="select-bookable"]');
  // the map object settings are a sub page of the editor, go back to save
  await page.click('[data-test="back-button"]');
  await page.click('[data-test="save-button"]');
  await expect(page.locator('[data-test="save-button"]')).toHaveCount(0);

  // book the map object
  await page.click('[data-test="spaces-button"]');
  await page.locator('[data-test="space-item"]', { hasText: 'E2E Space for booking highlight testing' }).click();
  await expect(page).toHaveURL(/\/bookables\/map$/);
  await page.click('[data-test="map-object-path"] >> nth=0');
  await expect(page).toHaveURL(/\/booking$/);
  await page.click('[data-test="submit-booking"]');
  // bookings in public spaces are confirmed first
  await page.click('[data-test="dialog-confirm"]');
  await expect(page).toHaveURL(/\/account\/bookings$/);
  await page.goBack();

  await expect(page).toHaveURL(/\/bookables\/map$/);
  await expect(page.locator('[data-test="map-object"][data-availability="occupied-by-me"]')).toHaveCount(1);
  await expect(page).toHaveScreenshot('my-booked-mapObject.png');

  await page.click('[data-test="button-end"]');
  await expect(page.locator('[data-test="bookable-list-item"]')).toHaveCount(1);
  await expect(page).toHaveScreenshot('my-booked-bookableList.png');
});
