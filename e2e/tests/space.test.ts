import { expect, test } from '@playwright/test';

test('Create a space and find it in the spaces list', async ({ page }) => {
  await page.goto('/spaces');
  await page.click('[data-test="profile-button"]');
  await page.click('text=My Spaces');
  await page.click('[data-test="create-space-button"]');
  const spaceName = 'E2E Space';
  await page.fill('[data-test="form-name"]', spaceName);
  await page.click('[data-test="create-space-button"]');
  await expect(page).toHaveURL(/\/settings\/space\/edit$/);
  await page.fill('[data-test="form-address"]', 'e2e');
  await page.fill('[data-test="form-description"]', 'This is a new space from the e2e test');
  await page.click('[data-test="save-space-button"]');
  await expect(page).toHaveURL(/\/settings\/info$/);

  await page.goto('/spaces');
  const space = page.locator('[data-test="space-item"]').first();
  await expect(space.locator('[data-test="label"]')).toContainText(spaceName);
  await expect(space.locator('[data-test="description"]')).toContainText('This is a new space from the e2e test');
  await expect(page).toHaveScreenshot('create-space.png');
});

test('Edit the currently selected space', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-space-information"]');
  await page.click('[data-test="edit-space-button"]');
  const space = {
    name: 'Updated Space',
    address: 'e2e',
    description: 'This is an updated space from the e2e test',
  };
  await page.fill('[data-test="form-name"]', space.name);
  await page.fill('[data-test="form-address"]', space.address);
  await page.fill('[data-test="form-description"]', space.description);
  await page.click('[data-test="save-space-button"]');
  await expect(page).toHaveURL(/\/settings\/info$/);
  await page.click('[data-test="edit-space-button"]');
  await expect(page.locator('[data-test="form-name"]')).toHaveValue(space.name);
  await expect(page.locator('[data-test="form-address"]')).toHaveValue(space.address);
  await expect(page.locator('[data-test="form-description"]')).toHaveValue(space.description);
  await expect(page).toHaveScreenshot('edit-space.png');
});

test('Create a space and add a map object', async ({ page }) => {
  await page.goto('/space/create');
  await page.fill('[data-test="form-name"]', 'Space with instant map object creation');
  await page.click('[data-test="create-space-button"]');
  await expect(page).toHaveURL(/\/settings\/space\/edit$/);
  // the edit page has no menu (like in v1), saving leads to the space information with the admin menu
  await page.click('[data-test="save-space-button"]');
  await expect(page).toHaveURL(/\/settings\/info$/);
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-map-objects"]');
  await page.click('[data-test="add-map-object-button"]');
  await page.click('[data-test="map-object-type-table"]');
  await page.click('[data-test="save-button"]');
  await expect(page.locator('[data-test="save-button"]')).toHaveCount(0);
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-map-objects"]');
  await expect(page.locator('[data-test="space-map"] [data-test="map-object"]')).toHaveCount(1);
  await expect(page).toHaveScreenshot('add-map-object.png');
});

test('Create a space and invite a member', async ({ page }) => {
  await page.goto('/space/create');
  await page.fill('[data-test="form-name"]', 'Space with invitation');
  await page.click('[data-test="create-space-button"]');
  await expect(page).toHaveURL(/\/settings\/space\/edit$/);
  await page.click('[data-test="save-space-button"]');
  await expect(page).toHaveURL(/\/settings\/info$/);
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-space-members"]');
  await page.click('[data-test="button-invite-member"]');
  const email = 'member@bookyp.de';
  await page.fill('[data-test="form-email"]', email);
  await page.click('[data-test="submit-invitation"]');
  await expect(page.locator('[data-test="invitation-item"]')).toContainText(email);
  await expect(page).toHaveScreenshot('invited-member.png');
});

test('Select a space with user role and try accessing admin routes', async ({ page }) => {
  await page.goto('/spaces');
  await page.locator('[data-test="space-item"]', { hasText: 'New Space with user role' }).click();
  await expect(page).toHaveURL(/\/bookables\/map$/);
  // users do not get the admin entry in the menu
  await expect(page.locator('[data-test="button-settings"]')).toHaveCount(0);
  await expect(page.locator('[data-test="button-space-info"]').first()).toBeVisible();
  // and are redirected back to the map when opening an admin page directly
  const spaceId = page.url().match(/\/space\/([^/]+)\//)?.[1];
  await page.goto(`/space/${spaceId}/settings/map-editor`);
  await expect(page).toHaveURL(/\/bookables\/map$/);
});
