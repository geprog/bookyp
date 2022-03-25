import { expect, test } from '@playwright/test';

test('Create a space and find it in the spaces list', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="spaces-button"]');
  await page.click('button:has-text("CREATE NEW SPACE")');
  const spaceName = 'E2E Space';
  await page.fill('[data-test="form-name"]', spaceName);
  await page.fill('[data-test="form-address"]', 'e2e');
  await page.fill('[data-test="form-description"]', 'This is a new space from the e2e test');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/spaces');
  const space = page.locator('[data-test="space-item"]').last();
  await expect(space.locator('[data-test="label"]')).toContainText(spaceName);
  await expect(space.locator('[data-test="description"]')).toContainText('admin');
  expect(await page.screenshot()).toMatchSnapshot('create-space.png');
});
