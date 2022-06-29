import { SampleModel } from '@bookyp/core';
import { expect, test } from '@playwright/test';

test('My Booking Object should be glowing orange color in Map-View', async ({ page }) => {
  // Creating and selecting a Space
  await page.goto('/');
  await page.click('[data-test="spaces-button"]');
  await page.click('button:has-text("CREATE NEW SPACE")');
  const spaceName = 'E2E Space for booking highlight testing';
  await page.fill('[data-test="form-name"]', spaceName);
  await page.fill('[data-test="form-address"]', 'e2e');
  await page.fill('[data-test="form-description"]', 'This is a new space from the e2e test');
  await page.click('button[type="submit"]');
  await page.click(`[data-test="space-item"]:has-text("${spaceName}")`);

  // Creating a Bookable Item
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-bookables"]');
  await page.click('[data-test="button-add-bookable"]');
  await page.fill('[data-test="form-name"]', SampleModel.sampleBookableThird.name);
  await page.fill('[data-test="form-description"]', SampleModel.sampleBookableThird.description);
  await page.click('button[type="submit"]');
  await page.click('[data-test="back-button"]');

  // Creating a Map Object and Linking it with Bookable Item
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="add-map-object-button"]');
  await page.click('[data-test="edit-button"]');
  await page.click('button:has-text("Link to bookable object")');
  await page.click('main >> div >>  nth=1 ');
  await page.click('[data-test="back-button"]');
  await page.click('[data-test="save-button"]');
  await page.click('[data-test="back-button"]');

  // Booking a Map Object and checking bookable list
  await Promise.all([page.waitForNavigation(), page.click('[data-test="map-object-path"]')]);
  await Promise.all([page.waitForNavigation(), page.click('button[type=submit]')]);
  await page.click('[data-test="back-button"]');

  await expect(page).toHaveURL('/bookables/map');

  await expect(page).toHaveScreenshot('my-booked-mapObject.png');

  await page.click('[data-test="button-end"]');

  await expect(page).toHaveScreenshot('my-booked-bookableList.png');
});
