/**
 * Step 1 of the migration from v1: exports the billing data of gringotts (the payment service of v1)
 * into a folder with `export.json` and the original invoice pdfs. It only reads, nothing is changed.
 * The folder is also the archive of the v1 invoices (keep it as long as invoices must be kept).
 *
 * Run it after v1 is stopped and before v2 starts (v2 removes the gringotts ids from the database):
 *   pnpm gringotts:export --env-file migration.env --dir gringotts-export
 *   ... --without-pdfs     skips downloading the invoice pdfs (only for trying it out)
 *
 * Environment:
 *   NUXT_MONGODB_URI          database of v1
 *   GRINGOTTS_DATABASE_URL    postgres database of gringotts
 *   GRINGOTTS_URL, GRINGOTTS_TOKEN   api of gringotts (url and api token of the project), for the pdfs
 */
import type { ExportedCustomer, ExportedInvoice, ExportedSubscription, GringottsExport } from './common';
import { Buffer } from 'node:buffer';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { MongoClient } from 'mongodb';
import pg from 'pg';
import { argValue, env, gringottsPeriodPrice, loadEnvFile, report, roundPrice } from './common';

interface CustomerRow {
  _id: string;
  payment_provider_id: string;
  balance: number;
  name: string;
  email: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  zip_code: string;
  country: string;
  language: string;
  mandate_id: string | null;
}

interface SubscriptionRow {
  _id: string;
  status: string;
  current_period_start: Date;
  current_period_end: Date;
  customer__id: string;
}

interface ChangeRow {
  start: Date;
  end: Date | null;
  price_per_unit: number;
  units: number;
  subscription__id: string;
}

interface InvoiceRow {
  _id: string;
  number: string;
  date: Date;
  status: string;
  vat_rate: number;
  currency: string;
  customer__id: string;
  metadata: { spaceId?: string } | null;
}

interface InvoiceItemRow {
  invoice__id: string;
  description: string;
  price_per_unit: number;
  units: number;
}

/** downloads the pdf gringotts rendered for an invoice */
async function downloadPdf(invoiceId: string): Promise<Buffer> {
  const url = env('GRINGOTTS_URL', true).replace(/\/$/, '');
  const linkResponse = await fetch(`${url}/api/invoice/${invoiceId}/generate-download-link`, { headers: { Authorization: `Bearer ${env('GRINGOTTS_TOKEN', true)}` } });
  if (!linkResponse.ok) {
    throw new Error(`download link: ${linkResponse.status}`);
  }
  const { url: downloadUrl } = await linkResponse.json() as { url: string };
  const pdfResponse = await fetch(downloadUrl);
  if (!pdfResponse.ok) {
    throw new Error(`download: ${pdfResponse.status}`);
  }
  return Buffer.from(await pdfResponse.arrayBuffer());
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  loadEnvFile(args);
  const dir = argValue(args, '--dir');
  if (!dir) {
    throw new Error('Pass the folder to export into with --dir');
  }
  if (existsSync(dir) && readdirSync(dir).length > 0) {
    throw new Error(`${dir} is not empty`);
  }
  const withPdfs = !args.includes('--without-pdfs');
  if (withPdfs) {
    env('GRINGOTTS_URL', true);
    env('GRINGOTTS_TOKEN', true);
  }

  const mongoClient = await MongoClient.connect(env('NUXT_MONGODB_URI', true));
  const gringotts = new pg.Client({ connectionString: env('GRINGOTTS_DATABASE_URL', true) });
  await gringotts.connect();
  let failed = false;
  try {
    const db = mongoClient.db();
    const users = await db.collection<{ email: string; paymentCustomerId?: string }>('users').find({ paymentCustomerId: { $exists: true } }).toArray();
    const spaces = await db.collection<{ name: string; plan?: string; subscription?: string }>('spaces').find({ subscription: { $exists: true } }).toArray();
    if (users.length === 0 && spaces.length === 0) {
      console.warn('⚠️ No user or space links to gringotts. Did v2 already start and remove the gringotts ids?');
    }

    const { rows: customerRows } = await gringotts.query<CustomerRow>(
      `select c.*, pm.payment_provider_id as mandate_id
         from customer c left join payment_method pm on pm._id = c.active_payment_method__id`,
    );
    const customers: ExportedCustomer[] = customerRows.map((row) => {
      const user = users.find(u => u.paymentCustomerId === row._id);
      return {
        gringottsId: row._id,
        userId: user?._id.toString() ?? null,
        userEmail: user?.email ?? null,
        name: row.name,
        email: row.email,
        addressLine1: row.address_line1,
        addressLine2: row.address_line2 ?? '',
        zipCode: row.zip_code,
        city: row.city,
        country: row.country,
        language: row.language,
        balance: row.balance,
        mollieCustomerId: row.payment_provider_id,
        mollieMandateId: row.mandate_id,
      };
    });
    customers.forEach(customer => report('customer', customer.name, customer.userId ? `user ${customer.userEmail}` : 'no v1 user links to it'));

    const { rows: subscriptionRows } = await gringotts.query<SubscriptionRow>('select * from subscription');
    const { rows: changeRows } = await gringotts.query<ChangeRow>('select * from subscription_change');
    const subscriptions: ExportedSubscription[] = [];
    for (const space of spaces) {
      const row = subscriptionRows.find(subscription => subscription._id === space.subscription);
      if (!row) {
        report('subscription', space.name, 'skipped: not found in gringotts');
        continue;
      }
      const changes = changeRows
        .filter(change => change.subscription__id === row._id)
        .map(change => ({ start: change.start, end: change.end, pricePerUnit: change.price_per_unit, units: change.units }));
      subscriptions.push({
        gringottsId: row._id,
        spaceId: space._id.toString(),
        spaceName: space.name,
        plan: space.plan ?? 'free',
        status: row.status,
        customerGringottsId: row.customer__id,
        currentPeriodStart: row.current_period_start.toISOString(),
        currentPeriodEnd: row.current_period_end.toISOString(),
        openPeriodNet: gringottsPeriodPrice(changes, row.current_period_start, row.current_period_end),
      });
      report('subscription', space.name, `${row.status}, ${space.plan}, period ends ${row.current_period_end.toISOString().slice(0, 10)}`);
    }

    const { rows: invoiceRows } = await gringotts.query<InvoiceRow>(
      `select i.*, s.metadata from invoice i left join subscription s on s._id = i.subscription__id where i.status <> 'draft' order by i.date`,
    );
    const { rows: itemRows } = await gringotts.query<InvoiceItemRow>('select * from invoice_item');
    if (withPdfs) {
      mkdirSync(join(dir, 'pdfs'), { recursive: true });
    }
    const invoices: ExportedInvoice[] = [];
    for (const row of invoiceRows) {
      const items = itemRows
        .filter(item => item.invoice__id === row._id)
        .map(item => ({ description: item.description, units: item.units, pricePerUnit: item.price_per_unit }));
      const amount = roundPrice(items.reduce((sum, item) => sum + item.pricePerUnit * item.units, 0));
      const vatAmount = roundPrice(amount * row.vat_rate / 100);
      let pdf: string | null = null;
      if (withPdfs) {
        try {
          pdf = join('pdfs', `${row.number.replace(/[^\w-]/g, '_')}.pdf`);
          writeFileSync(join(dir, pdf), await downloadPdf(row._id));
        }
        catch (error) {
          pdf = null;
          failed = true;
          report('invoice', row.number, `failed: pdf could not be downloaded (${(error as Error).message})`);
        }
      }
      invoices.push({
        gringottsId: row._id,
        number: row.number,
        date: row.date.toISOString(),
        status: row.status,
        spaceId: row.metadata?.spaceId ?? null,
        customerGringottsId: row.customer__id,
        currency: row.currency,
        vatRate: row.vat_rate,
        items,
        amount,
        vatAmount,
        totalAmount: roundPrice(amount + vatAmount),
        pdf,
      });
      if (pdf || !withPdfs) {
        report('invoice', row.number, `${row.status}${pdf ? `, ${pdf}` : ''}`);
      }
    }

    const data: GringottsExport = { version: 1, exportedAt: new Date().toISOString(), customers, subscriptions, invoices };
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'export.json'), `${JSON.stringify(data, null, 2)}\n`);
    console.log(`\n📦 Exported ${customers.length} customers, ${subscriptions.length} subscriptions and ${invoices.length} invoices to ${dir}`);
  }
  finally {
    await gringotts.end();
    await mongoClient.close();
  }
  if (failed) {
    console.error('🔥 Some invoice pdfs are missing, fix the cause and export again into an empty folder');
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('🔥', error);
  process.exit(1);
});
