import { expect, test } from '@playwright/test';

test('Delete a space', async ({ page }) => {
  await page.goto('/space/create');
  await page.fill('[data-test="form-name"]', 'Space to delete');
  await page.click('[data-test="create-space-button"]');
  await expect(page).toHaveURL(/\/settings\/space\/edit$/);
  await page.click('[data-test="delete-space-button"]');
  await page.click('[data-test="dialog-confirm"]');
  await expect(page.locator('[data-test="dialog"]')).toHaveCount(0);
  await expect(page).toHaveURL(/\/spaces$/);
  await expect(page.locator('[data-test="space-item"]', { hasText: 'Space to delete' })).toHaveCount(0);
});
