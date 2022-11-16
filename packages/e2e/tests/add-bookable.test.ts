import { SampleModel } from '@bookyp/core';
import { expect, test } from '@playwright/test';

test('Add a bookable and find it in the settings bookables list', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-bookables"]');
  await page.click('[data-test="button-add-bookable"]');
  await page.fill('[data-test="form-name"]', SampleModel.sampleBookableThird.name);
  await page.fill('[data-test="form-description"]', SampleModel.sampleBookableThird.description);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(new RegExp('/bookables$'));
  const bookableItems = page.locator('[data-test="bookable-item"]');
  await expect(bookableItems).toHaveCount(3);
  const newBookableItem = bookableItems.last();
  await expect(newBookableItem).toContainText(SampleModel.sampleBookableThird.name);
  await expect(newBookableItem).toContainText(SampleModel.sampleBookableThird.description);
  await page.mouse.move(0, 0); // move mouse away from menu icons so that nothing is hovered by accident
  await expect(page).toHaveScreenshot('added-bookable.png');
});
