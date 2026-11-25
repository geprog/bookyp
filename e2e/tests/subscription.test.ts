import { expect, test } from '@playwright/test';

/** the whole payment flow against the mocked payment provider */
test('Upgrade a space to the standard plan and get an invoice', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-test="button-settings"]');
  await page.click('[data-test="button-subscription"]');
  await expect(page.locator('[data-test="plan-card-free"]')).toContainText('Current plan');
  await page.click('[data-test="change-plan-standard"]');
  await expect(page).toHaveURL(/\/subscription\/upgrade\/standard$/);

  // billing details first
  await expect(page.locator('[data-test="save-customer-button"]')).toBeDisabled();
  await page.fill('[data-test="customer-organization-name"]', 'Wonderland GmbH');
  await page.fill('[data-test="customer-vat-number"]', 'DE123456789');
  await page.fill('[data-test="customer-address1"]', 'Rabbit Hole 1');
  await page.fill('[data-test="customer-city"]', 'Wonderland');
  await page.fill('[data-test="customer-zip"]', '12345');
  await page.selectOption('[data-test="customer-country"]', 'DE');
  await page.click('[data-test="save-customer-button"]');

  // the first month is paid in the (mocked) checkout, which also creates the payment method
  await expect(page.locator('[data-test="checkout-hint"]')).toBeVisible();
  await page.click('[data-test="change-plan-button"]');
  await page.waitForURL(/\/api\/payment\/mock\/checkout/);
  await expect(page.locator('main')).toContainText('46.41 EUR');
  await page.click('[data-test="mock-pay"]');
  await page.waitForURL(/\/settings\/subscription/);
  await expect(page.locator('[data-test="plan-card-standard"]')).toContainText('Current plan', { timeout: 25_000 });
  // the plan switched, the hint about the pending payment is gone
  await expect(page).toHaveURL(/\/settings\/subscription$/);
  await expect(page.locator('[data-test="waiting-for-payment"]')).toHaveCount(0);

  // the paid first month results in an invoice
  await expect(page.locator('[data-test="invoice-item"]')).toHaveCount(1, { timeout: 25_000 });
  await expect(page.locator('[data-test="invoice-item"]')).toContainText('46.41 €');
  await expect(page.locator('[data-test="invoice-item"]')).toContainText('INV-0000001');
  const pdfLink = page.locator('[data-test="invoice-item"] a', { hasText: 'PDF' });
  const href = await pdfLink.getAttribute('href');
  expect(href).toMatch(/\/invoices\/[a-f0-9]+\/pdf$/);
  const pdf = await page.request.get(href!);
  expect(pdf.ok()).toBe(true);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
  expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');

  // an upgrade during the paid period charges the price difference for the rest of the period right away
  await page.click('[data-test="change-plan-pro"]');
  await expect(page.locator('[data-test="due-today"]')).toContainText(/Due today: \d+\.\d{2}€/);
  await page.click('[data-test="change-plan-button"]');
  await expect(page).toHaveURL(/\/settings\/subscription$/);
  await expect(page.locator('[data-test="plan-card-pro"]')).toContainText('Current plan');
  await expect(page.locator('[data-test="invoice-item"]')).toHaveCount(2, { timeout: 25_000 });

  // a downgrade takes effect at the end of the paid period
  await page.click('[data-test="change-plan-free"]');
  await expect(page.locator('[data-test="downgrade-hint"]')).toBeVisible();
  await page.click('[data-test="change-plan-button"]');
  await expect(page).toHaveURL(/\/settings\/subscription$/);
  await expect(page.locator('[data-test="plan-card-pro"]')).toContainText('Current plan');
  await expect(page.locator('[data-test="scheduled-plan-change"]')).toContainText('Your plan changes to "free"');

  // ... and can be taken back without paying again
  await page.click('[data-test="keep-plan"]');
  await expect(page).toHaveURL(/\/subscription\/upgrade\/pro$/);
  await expect(page.locator('[data-test="due-today"]')).toHaveCount(0);
  await page.click('[data-test="change-plan-button"]');
  await expect(page).toHaveURL(/\/settings\/subscription$/);
  await expect(page.locator('[data-test="scheduled-plan-change"]')).toHaveCount(0);
  await expect(page.locator('[data-test="plan-card-pro"]')).toContainText('Current plan');
  await expect(page.locator('[data-test="invoice-item"]')).toHaveCount(2);

  // a new payment method (credit card or PayPal) is added without charging anything and used for the subscription from now on
  await page.click('[data-test="edit-billing-details"]');
  await expect(page).toHaveURL(/\/subscription\/billing$/);
  await expect(page.locator('[data-test="payment-method"]')).toHaveCount(1);
  await page.click('[data-test="add-payment-method"]');
  await page.click('[data-test="dialog-confirm"]');
  await page.waitForURL(/\/api\/payment\/mock\/checkout/);
  await expect(page.locator('main')).toContainText('0.00 EUR');
  await page.click('[data-test="mock-pay"]');
  await page.waitForURL(/\/subscription\/billing$/);
  await expect(page.locator('[data-test="payment-method"]')).toHaveCount(2);
  const customer = await (await page.request.get('/api/payment/customer')).json() as { activePaymentMethod: string };
  const methods = await (await page.request.get('/api/payment/methods')).json() as { _id: string }[];
  expect(customer.activePaymentMethod).toBe(methods[1]?._id);
});
