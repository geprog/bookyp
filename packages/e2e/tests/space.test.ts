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

test('Edit the currently selected space', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-space-information"]');
  const space = {
    name: 'Updated Space',
    address: 'e2e',
    description: 'This is an updated space from the e2e test',
  };
  await page.fill('[data-test="form-name"]', space.name);
  await page.fill('[data-test="form-address"]', space.address);
  await page.fill('[data-test="form-description"]', space.description);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/bookables/map');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-space-information"]');
  expect(await page.inputValue('[data-test="form-name"]')).toBe(space.name);
  expect(await page.inputValue('[data-test="form-address"]')).toBe(space.address);
  expect(await page.inputValue('[data-test="form-description"]')).toBe(space.description);
  expect(await page.screenshot()).toMatchSnapshot('edit-space.png');
});

test('Create a space and add a mapObject', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="spaces-button"]');
  await page.click('button:has-text("CREATE NEW SPACE")');
  const spaceName = 'Space with instant mapObject creation';
  await page.fill('[data-test="form-name"]', spaceName);
  await page.click('button[type="submit"]');
  await page.click('[data-test="space-item"] >> nth=-1');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="add-map-object-button"]');
  await page.click('[data-test="save-button"]');
  await expect(page.locator('#app > div > div > svg > g')).toHaveCount(1);
  expect(await page.screenshot()).toMatchSnapshot('add-map-object.png');
});

test('Create a space and invite a member', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="spaces-button"]');
  await page.click('button:has-text("CREATE NEW SPACE")');
  const spaceName = 'Space with invitation';
  await page.fill('[data-test="form-name"]', spaceName);
  await page.click('button[type="submit"]');
  await page.click('[data-test="space-item"] >> nth=-1');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-space-members"]');
  await page.click('[data-test="button-invite-member"]');
  const email = 'member@bookyp.de';
  await page.fill('[data-test="form-email"]', email);
  await page.click('button[type="submit"]');
  await expect(page.locator('[data-test="invitation-item"]')).toContainText(email);
  expect(await page.screenshot()).toMatchSnapshot('invited-member.png');
});
