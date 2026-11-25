/**
 * Step 2 of the migration from v1: imports the export of `export.ts` into v2. Run it after v2 started
 * once (v2 removes the gringotts ids from the database on its first start).
 *
 *   pnpm gringotts:import --env-file migration.env --dir gringotts-export            dry run
 *   pnpm gringotts:import --env-file migration.env --dir gringotts-export --apply    imports
 *   ... --skip-open-period    does not charge the open gringotts period
 *
 * Environment:
 *   NUXT_MONGODB_URI          database of v2
 *   NUXT_PUBLIC_APP_URL       public url of v2, the payment provider sends the payment webhooks there
 *   NUXT_PAYMENT_PROVIDER     'mollie' (or 'mock' to try the migration locally with a running app)
 *   NUXT_PAYMENT_MOLLIE_API_KEY, NUXT_PAYMENT_VAT_RATE, NUXT_PAYMENT_CURRENCY
 *
 * What it does:
 * - customers: billing details, the Mollie customer and the active mandate become payment customers of v2.
 *   v1 did not know VAT IDs, so the customers are companies without one: their invoices wait until
 *   they complete the billing details in the app
 * - subscriptions: every active gringotts subscription is replaced by a Mollie subscription that starts
 *   at the end of the current gringotts period, so paying spaces keep running
 * - the current gringotts period is still unbilled (gringotts bills at the end of a period), it is
 *   charged once right away (minus the credit of the customer); v2 creates the invoice when the
 *   payment provider reports the payment through the webhook
 * - invoices of v1 are not imported, the export folder is their archive
 *
 * Gringotts and v2 must use the same Mollie account. The import can run again, imported entries are skipped.
 */
import type { Collection } from 'mongodb';
import type { DbPaymentCustomer, DbPaymentMock, DbSpace } from '../../server/utils/dbTypes';
import type { SpacePlan } from '../../shared/types/models';
import type { ExportedCustomer, ExportedSubscription, GringottsExport } from './common';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import dayjs from 'dayjs';
import { Client } from 'mollie-api-typescript';
import { MongoClient, ObjectId } from 'mongodb';
import { countryCode } from '../../shared/utils/billing';
import { isSpacePlan, spacePlans } from '../../shared/utils/plans';
import { argValue, env, loadEnvFile, report, roundPrice } from './common';

/** same as in the app: days a plan stays active after the next payment is due */
const gracePeriodDays = 7;

/** the payment provider calls the import needs (Mollie, or the in-database mock of the app) */
interface Payments {
  createSubscription: (customerId: string, data: { amount: number; description: string; mandateId: string; startDate: string; metadata: Record<string, unknown> }) => Promise<string>;
  createRecurringPayment: (customerId: string, data: { amount: number; description: string; mandateId: string; metadata: Record<string, unknown> }) => Promise<void>;
}

interface Context {
  apply: boolean;
  chargeOpenPeriod: boolean;
  spaces: Collection<DbSpace>;
  paymentCustomers: Collection<DbPaymentCustomer>;
  payments: Payments;
  failed: boolean;
}

function currency(): string {
  return env('NUXT_PAYMENT_CURRENCY') || 'EUR';
}

function withVat(net: number): number {
  return roundPrice(net * (1 + Number(env('NUXT_PAYMENT_VAT_RATE') || 19) / 100));
}

function webhookUrl(): string {
  return `${env('NUXT_PUBLIC_APP_URL', true).replace(/\/$/, '')}/api/payment/webhook`;
}

function molliePayments(): Payments {
  const mollie = new Client({ security: { apiKey: env('NUXT_PAYMENT_MOLLIE_API_KEY', true) } });
  const amount = (value: number) => ({ value: value.toFixed(2), currency: currency() });
  return {
    async createSubscription(customerId, data) {
      const subscription = await mollie.subscriptions.create({
        customerId,
        // a repeated import after an error must not create the subscription twice
        idempotencyKey: `gringotts-subscription-${String(data.metadata.spaceId)}`,
        subscriptionRequest: {
          amount: amount(data.amount),
          interval: '1 month',
          description: data.description,
          mandateId: data.mandateId,
          startDate: data.startDate,
          webhookUrl: webhookUrl(),
          metadata: data.metadata,
        },
      });
      return subscription.id;
    },
    async createRecurringPayment(customerId, data) {
      await mollie.customers.createPayment({
        customerId,
        idempotencyKey: `gringotts-open-period-${String(data.metadata.spaceId)}`,
        paymentRequest: {
          amount: amount(data.amount),
          description: data.description,
          sequenceType: 'recurring',
          mandateId: data.mandateId,
          webhookUrl: webhookUrl(),
          metadata: data.metadata,
        },
      });
    },
  };
}

/** writes into the in-database mock of the app (`NUXT_PAYMENT_PROVIDER=mock`) and calls the webhook of the running app */
function mockPayments(paymentMock: Collection<DbPaymentMock>): Payments {
  const id = (prefix: string) => `${prefix}_${randomBytes(6).toString('hex')}`;
  return {
    async createSubscription(customerId, data) {
      const subscription = { ...data, id: id('sub'), customerId, status: 'active', currency: currency(), webhookUrl: webhookUrl(), nextPaymentDate: data.startDate, createdAt: new Date().toISOString() };
      await paymentMock.insertOne({ _id: subscription.id, type: 'subscription', data: subscription });
      return subscription.id;
    },
    async createRecurringPayment(customerId, data) {
      const now = new Date().toISOString();
      const payment = { ...data, id: id('tr'), status: 'paid', currency: currency(), createdAt: now, paidAt: now, customerId, sequenceType: 'recurring' };
      await paymentMock.insertOne({ _id: payment.id, type: 'payment', data: payment });
      const response = await fetch(webhookUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: payment.id }) });
      if (!response.ok) {
        throw new Error(`Webhook of the app failed with ${response.status}`);
      }
    },
  };
}

/** the billing details of v2 for a gringotts customer (a company, v1 did not ask for the VAT ID) */
function toPaymentCustomer(customer: ExportedCustomer & { userId: string }): Omit<DbPaymentCustomer, '_id'> {
  return {
    userId: customer.userId,
    type: 'business',
    organizationName: customer.name,
    vatNumber: '',
    organizationNumber: '',
    givenName: '',
    familyName: '',
    email: customer.email,
    addressLine1: customer.addressLine1,
    addressLine2: customer.addressLine2,
    zipCode: customer.zipCode,
    city: customer.city,
    country: countryCode(customer.country) ?? '',
    language: customer.language === 'de' ? 'de' : 'en',
    providerCustomerId: customer.mollieCustomerId,
    ...(customer.mollieMandateId ? { activePaymentMethod: customer.mollieMandateId } : {}),
  };
}

async function importCustomer(ctx: Context, customer: ExportedCustomer): Promise<string> {
  if (!customer.userId) {
    return 'skipped: no v1 user links to it';
  }
  if ((await ctx.paymentCustomers.findOne({ userId: customer.userId }))?.providerCustomerId) {
    return 'skipped: already has a payment customer';
  }
  const data = toPaymentCustomer({ ...customer, userId: customer.userId });
  if (ctx.apply) {
    await ctx.paymentCustomers.updateOne({ userId: data.userId }, { $set: data }, { upsert: true });
  }
  const missing = [
    'VAT ID or commercial register number',
    data.addressLine1 && data.zipCode && data.city ? '' : 'address',
    data.country ? '' : `country (unknown: "${customer.country}")`,
  ].filter(Boolean).join(', ');
  return `${ctx.apply ? 'imported' : 'would import'}${data.activePaymentMethod ? '' : ' without payment method'}, invoices wait for: ${missing}`;
}

async function importSubscription(ctx: Context, subscription: ExportedSubscription, customers: ExportedCustomer[]): Promise<string> {
  if (!['active', 'processing'].includes(subscription.status)) {
    return `skipped: gringotts subscription is ${subscription.status}`;
  }
  const space = ObjectId.isValid(subscription.spaceId) ? await ctx.spaces.findOne({ _id: new ObjectId(subscription.spaceId) }) : null;
  if (!space) {
    return 'skipped: space not found';
  }
  if (space.subscription) {
    return 'skipped: already has a subscription';
  }
  const plan = space.plan as SpacePlan;
  if (!isSpacePlan(plan) || plan === 'free') {
    return 'skipped: space is on the free plan';
  }
  const customer = customers.find(c => c.gringottsId === subscription.customerGringottsId);
  if (!customer?.userId) {
    return 'skipped: owner of the subscription not found';
  }
  if (!customer.mollieMandateId) {
    return 'skipped: owner has no payment method';
  }

  const periodStart = new Date(subscription.currentPeriodStart);
  const periodEnd = new Date(subscription.currentPeriodEnd);
  const startDate = dayjs(periodEnd).isAfter(dayjs()) ? periodEnd : new Date();
  const credit = roundPrice(Math.min(Math.max(customer.balance, 0), subscription.openPeriodNet));
  const toCharge = roundPrice(subscription.openPeriodNet - credit);
  const charge = ctx.chargeOpenPeriod && toCharge >= 0.01
    ? `, charge ${toCharge.toFixed(2)} net for ${dayjs(periodStart).format('DD.MM.YYYY')} - ${dayjs(periodEnd).format('DD.MM.YYYY')}${credit > 0 ? ` (credit ${credit.toFixed(2)})` : ''}`
    : '';
  const summary = `${plan} subscription for ${customer.userEmail} starting ${dayjs(startDate).format('DD.MM.YYYY')}${charge}`;
  if (!ctx.apply) {
    return `would create ${summary}`;
  }

  const subscriptionId = await ctx.payments.createSubscription(customer.mollieCustomerId, {
    amount: withVat(spacePlans[plan].pricePerMonth),
    description: `Bookyp ${plan} plan - ${space.name} (${space._id.toString()})`,
    mandateId: customer.mollieMandateId,
    startDate: dayjs(startDate).format('YYYY-MM-DD'),
    metadata: { spaceId: space._id.toString(), plan },
  });
  const activeUntil = dayjs(startDate).add(gracePeriodDays, 'day').toDate();
  await ctx.spaces.updateOne({ _id: space._id }, {
    $set: {
      subscription: subscriptionId,
      subscriptionOwner: customer.userId,
      currentPeriodEnd: startDate,
      ...(!space.activeUntil || space.activeUntil < activeUntil ? { activeUntil } : {}),
    },
  });

  if (charge) {
    await ctx.payments.createRecurringPayment(customer.mollieCustomerId, {
      amount: withVat(toCharge),
      description: `Bookyp ${plan} plan - ${space.name} (${dayjs(periodStart).format('DD.MM.YYYY')} - ${dayjs(periodEnd).format('DD.MM.YYYY')})`,
      mandateId: customer.mollieMandateId,
      // handled by the payment webhook of the app, which creates the invoice
      metadata: {
        purpose: 'legacy-period',
        spaceId: space._id.toString(),
        plan,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        credit,
      },
    });
  }
  return `created ${summary}`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  loadEnvFile(args);
  const dir = argValue(args, '--dir');
  if (!dir) {
    throw new Error('Pass the folder of the export with --dir');
  }
  const data = JSON.parse(readFileSync(join(dir, 'export.json'), 'utf8')) as GringottsExport;
  if (data.version !== 1) {
    throw new Error(`Unknown export version ${data.version}`);
  }
  // checked before anything is changed, the payments need it for their webhooks
  webhookUrl();

  const mongoClient = await MongoClient.connect(env('NUXT_MONGODB_URI', true));
  const db = mongoClient.db();
  const ctx: Context = {
    apply: args.includes('--apply'),
    chargeOpenPeriod: !args.includes('--skip-open-period'),
    spaces: db.collection<DbSpace>('spaces'),
    paymentCustomers: db.collection<DbPaymentCustomer>('paymentcustomers'),
    payments: env('NUXT_PAYMENT_PROVIDER') === 'mock' ? mockPayments(db.collection<DbPaymentMock>('paymentmock')) : molliePayments(),
    failed: false,
  };

  console.log(ctx.apply ? `🚚 Importing the gringotts export of ${data.exportedAt}\n` : '🔍 Dry run, nothing is changed (pass --apply to import)\n');
  const run = async (section: string, name: string, task: () => Promise<string>) => {
    try {
      report(section, name, await task());
    }
    catch (error) {
      ctx.failed = true;
      report(section, name, `failed: ${(error as Error).message}`);
    }
  };
  try {
    for (const customer of data.customers) {
      await run('customer', customer.userEmail ?? customer.name, () => importCustomer(ctx, customer));
    }
    for (const subscription of data.subscriptions) {
      await run('subscription', subscription.spaceName, () => importSubscription(ctx, subscription, data.customers));
    }
  }
  finally {
    await mongoClient.close();
  }
  if (ctx.failed) {
    console.error('\n🔥 Some entries failed, fix the cause and run the import again (imported entries are skipped)');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('🔥', error);
  process.exit(1);
});
