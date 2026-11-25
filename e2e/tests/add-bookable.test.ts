import { expect, test } from '@playwright/test';
import { sampleBookableThird } from '../../scripts/sampleData';

test('Add a bookable and find it in the settings bookables list', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-bookables"]');
  await page.click('[data-test="button-add-bookable"]');
  await page.fill('[data-test="form-name"]', sampleBookableThird.name);
  await page.fill('[data-test="form-description"]', sampleBookableThird.description);
  await page.click('[data-test="submit-bookable"]');
  await expect(page).toHaveURL(/\/settings\/bookable$/);
  const bookableItems = page.locator('[data-test="bookable-item"]');
  await expect(bookableItems).toHaveCount(3);
  const newBookableItem = bookableItems.last();
  await expect(newBookableItem).toContainText(sampleBookableThird.name);
  await expect(newBookableItem).toContainText(sampleBookableThird.description);
  await page.mouse.move(0, 0);
  await expect(page).toHaveScreenshot('added-bookable.png');
});
