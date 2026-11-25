import { Buffer } from 'node:buffer';
import { expect, test } from '@playwright/test';

/** a 1x1 png */
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');

test('Upload and remove a space image', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-space-information"]');
  await page.click('[data-test="edit-space-button"]');
  const image = page.locator('[data-test="space-image"]');
  const storedImage = page.locator('[data-test="space-image"][src*="/api/spaces/"][src*="/image"]');

  // like v1 the image is only a preview until the space is saved
  await page.setInputFiles('input[type="file"]', { name: 'space.png', mimeType: 'image/png', buffer: png });
  await expect(image).toHaveAttribute('src', /^blob:/);
  await page.click('[data-test="save-space-button"]');
  await page.click('[data-test="edit-space-button"]');
  await expect(storedImage).toBeVisible();

  await page.click('[data-test="clear-image"]');
  await expect(image).toHaveCount(0);
  await page.click('[data-test="save-space-button"]');
  await page.click('[data-test="edit-space-button"]');
  await expect(page.locator('[data-test="form-name"]')).toBeVisible();
  await expect(image).toHaveCount(0);
});
