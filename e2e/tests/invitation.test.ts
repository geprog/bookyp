import { expect, test } from '@playwright/test';

/** alice invites toni, toni accepts the invitation in a second session */
test('An invited user can accept the invitation and sees the space', async ({ page, browser, baseURL }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-space-members"]');
  await page.click('[data-test="button-invite-member"]');
  await page.fill('[data-test="form-email"]', 'toni@test.com');
  await page.click('[data-test="submit-invitation"]');
  await expect(page.locator('[data-test="invitation-item"]')).toContainText('toni@test.com');

  const toniContext = await browser.newContext({ storageState: undefined });
  const toni = await toniContext.newPage();
  await toni.goto(`${baseURL}/auth/login`);
  await toni.click('[data-test="login-button"]');
  await toni.fill('input[name="username"]', 'toni');
  await toni.click('input[type=submit]');
  await toni.waitForURL(`${baseURL}/**`);
  await toni.goto(`${baseURL}/spaces`);
  const invitation = toni.locator('[data-test="invitation-item"]', { hasText: 'New Space' });
  await expect(invitation).toBeVisible();
  await invitation.locator('[data-test="accept-invitation"]').click();
  await expect(toni).toHaveURL(/\/bookables\/map$/);
  // toni is a regular user of the space now: info instead of admin in the menu
  await expect(toni.locator('[data-test="button-space-info"]').first()).toBeVisible();
  await toniContext.close();

  // alice sees the new member
  await page.reload();
  await expect(page.locator('[data-test="member-item"]', { hasText: 'Toni Tester' })).toBeVisible();
});
