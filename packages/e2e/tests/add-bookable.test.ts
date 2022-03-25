import { expect, test } from '@playwright/test';

test('Add a bookable and find it in the settings bookables list', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-bookables"]');
  await page.click('[aria-label="Create bookable"]');
  await page.fill('[data-test="form-name"]', 'Desk 3');
  await page.fill('[data-test="form-description"]', 'Desk with big monitor');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/settings/bookables');
  const bookableItem = page.locator('[data-test="bookable-item"]').last();
  await expect(bookableItem).toContainText('Desk 3');
  await expect(bookableItem).toContainText('Desk with big monitor');
  await page.mouse.move(0, 0); // move mouse away from menu icons so that nothing is hovered by accident
  expect(await page.screenshot()).toMatchSnapshot('added-bookable.png');
});
