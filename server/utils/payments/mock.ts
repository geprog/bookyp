import type { CustomerInput, PaymentProvider, ProviderMandate, ProviderPayment, ProviderSubscription, SalesInvoiceInput, SubscriptionInput } from './provider';
import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import dayjs from 'dayjs';

/**
 * A payment provider that behaves like Mollie but keeps everything in the database.
 * Used for local development and tests. The checkout is a small html page served by
 * `/api/payment/mock/checkout` that lets you complete or cancel the payment.
 */

type MockCustomer = CustomerInput & { id: string };
type MockMandate = ProviderMandate & { customerId: string };
type MockSubscription = ProviderSubscription & SubscriptionInput & { customerId: string; createdAt: string };
type MockPayment = ProviderPayment & { redirectUrl?: string; description: string; mandateId?: string; methods?: ('creditcard' | 'paypal')[] };
type MockSalesInvoice = SalesInvoiceInput & { id: string; number: string };

function id(prefix: string): string {
  return `${prefix}_${randomBytes(6).toString('hex')}`;
}

type MockType = 'customer' | 'mandate' | 'subscription' | 'payment' | 'invoice';

async function store<T extends { id: string }>(type: MockType, data: T): Promise<T> {
  const { paymentMock } = await useCollections();
  await paymentMock.updateOne({ _id: data.id }, { $set: { type, data: data as Record<string, unknown> } }, { upsert: true });
  return data;
}

async function load<T>(type: MockType, entryId: string): Promise<T> {
  const { paymentMock } = await useCollections();
  const doc = await paymentMock.findOne({ _id: entryId, type });
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Mock ${type} ${entryId} not found` });
  }
  return doc.data as T;
}

async function list<T>(type: MockType, filter: Record<string, unknown>): Promise<T[]> {
  const { paymentMock } = await useCollections();
  const mapped = Object.fromEntries(Object.entries(filter).map(([key, value]) => [`data.${key}`, value]));
  const docs = await paymentMock.find({ type, ...mapped }).toArray();
  return docs.map(doc => doc.data as T);
}

/** Creates a paid payment for a subscription period and notifies the app like a webhook would. */
async function chargeSubscription(subscription: MockSubscription): Promise<void> {
  const now = new Date().toISOString();
  const payment: MockPayment = {
    id: id('tr'),
    status: 'paid',
    amount: subscription.amount,
    currency: subscription.currency,
    createdAt: now,
    paidAt: now,
    customerId: subscription.customerId,
    subscriptionId: subscription.id,
    sequenceType: 'recurring',
    metadata: subscription.metadata,
    description: subscription.description,
  };
  await store('payment', payment);
  await handlePaymentUpdate(payment.id);
}

export const mockProvider: PaymentProvider = {
  async createCustomer(data) {
    const customer = await store<MockCustomer>('customer', { ...data, id: id('cst') });
    return customer.id;
  },

  async updateCustomer(customerId, data) {
    await store<MockCustomer>('customer', { ...data, id: customerId });
  },

  async listMandates(customerId) {
    const mandates = await list<MockMandate>('mandate', { customerId });
    return mandates.map(({ customerId: _customerId, ...mandate }) => mandate);
  },

  async revokeMandate(_customerId, mandateId) {
    const { paymentMock } = await useCollections();
    await paymentMock.deleteOne({ _id: mandateId, type: 'mandate' });
  },

  async createMandateCheckout(customerId, options) {
    const payment = await store<MockPayment>('payment', {
      id: id('tr'),
      status: 'open',
      amount: options.amount,
      currency: options.currency,
      createdAt: new Date().toISOString(),
      customerId,
      sequenceType: 'first',
      description: options.description,
      redirectUrl: options.redirectUrl,
      metadata: options.metadata,
      ...(options.methods ? { methods: options.methods } : {}),
    });
    const { origin } = new URL(options.redirectUrl);
    return { checkoutUrl: `${origin}/api/payment/mock/checkout?payment=${payment.id}` };
  },

  async createSubscription(customerId, data) {
    const [existing] = data.idempotencyKey ? await list<MockSubscription>('subscription', { idempotencyKey: data.idempotencyKey }) : [];
    if (existing) {
      return { id: existing.id, status: existing.status, nextPaymentDate: existing.nextPaymentDate };
    }
    const startsLater = !!data.startDate && dayjs(data.startDate).isAfter(dayjs(), 'day');
    const subscription = await store<MockSubscription>('subscription', {
      ...data,
      id: id('sub'),
      customerId,
      status: 'active',
      nextPaymentDate: startsLater ? data.startDate : dayjs().add(1, 'month').format('YYYY-MM-DD'),
      createdAt: new Date().toISOString(),
    });
    // the first period is charged immediately unless the subscription starts later
    if (!startsLater) {
      notifyLater(() => chargeSubscription(subscription));
    }
    return { id: subscription.id, status: subscription.status, nextPaymentDate: subscription.nextPaymentDate };
  },

  async updateSubscription(_customerId, subscriptionId, data) {
    const existing = await load<MockSubscription>('subscription', subscriptionId);
    const subscription = await store<MockSubscription>('subscription', { ...existing, ...data });
    return { id: subscription.id, status: subscription.status, nextPaymentDate: subscription.nextPaymentDate };
  },

  async cancelSubscription(_customerId, subscriptionId) {
    const existing = await load<MockSubscription>('subscription', subscriptionId);
    await store<MockSubscription>('subscription', { ...existing, status: 'canceled', nextPaymentDate: undefined });
  },

  async getSubscription(_customerId, subscriptionId) {
    const subscription = await load<MockSubscription>('subscription', subscriptionId);
    return { id: subscription.id, status: subscription.status, nextPaymentDate: subscription.nextPaymentDate };
  },

  async createRecurringPayment(customerId, data) {
    const now = new Date().toISOString();
    const payment = await store<MockPayment>('payment', {
      id: id('tr'),
      status: 'paid',
      amount: data.amount,
      currency: data.currency,
      createdAt: now,
      paidAt: now,
      customerId,
      sequenceType: 'recurring',
      metadata: data.metadata,
      description: data.description,
      mandateId: data.mandateId,
    });
    // like Mollie the result is reported through the webhook
    notifyLater(() => handlePaymentUpdate(payment.id));
    return payment;
  },

  async createSalesInvoice(data) {
    const [existing] = await list<MockSalesInvoice>('invoice', { paymentId: data.paymentId });
    if (existing) {
      return { id: existing.id, number: existing.number };
    }
    const { paymentMock } = await useCollections();
    const count = await paymentMock.countDocuments({ type: 'invoice' });
    const invoice = await store<MockSalesInvoice>('invoice', { ...data, id: id('invoice'), number: `INV-${String(count + 1).padStart(7, '0')}` });
    return { id: invoice.id, number: invoice.number };
  },

  async getSalesInvoicePdf(invoiceId) {
    const invoice = await load<MockSalesInvoice>('invoice', invoiceId);
    const net = invoice.lines.reduce((sum, line) => sum + line.amount, 0) - (invoice.discount ?? 0);
    return mockPdf([`Mock invoice ${invoice.number}`, ...invoice.lines.map(line => `${line.description}: ${line.amount.toFixed(2)}`), `Net ${net.toFixed(2)} ${invoice.currency}, VAT ${invoice.vatRate}%`]);
  },

  async getPayment(paymentId) {
    return load<MockPayment>('payment', paymentId);
  },
};

// cspell:ignore nendobj nstartxref
/** a minimal single page pdf with the given lines of text */
function mockPdf(lines: string[]): Buffer {
  const escape = (text: string) => text.replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, char => `\\${char}`);
  const content = `BT /F1 11 Tf 50 780 Td 14 TL ${lines.map(line => `(${escape(line)}) '`).join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

/** calls the given function shortly after the current request, like a webhook of the provider would */
function notifyLater(fn: () => Promise<void>): void {
  setTimeout(() => void fn().catch(error => console.error('🔥 Mock webhook failed', error)), 100);
}

/** Completes or cancels a mock checkout. Returns the url to redirect the customer to. */
export async function completeMockCheckout(paymentId: string, outcome: 'paid' | 'failed'): Promise<string> {
  const payment = await load<MockPayment>('payment', paymentId);
  if (payment.status !== 'open') {
    return payment.redirectUrl ?? '/';
  }
  const now = new Date().toISOString();
  let mandateId: string | undefined;
  if (outcome === 'paid' && payment.customerId) {
    const methods = payment.methods ?? ['directdebit', 'creditcard'] as const;
    const method = methods[Math.floor(Math.random() * methods.length)]!;
    mandateId = id('mdt');
    await store<MockMandate>('mandate', {
      id: mandateId,
      customerId: payment.customerId,
      method,
      status: 'valid',
      name: `${{ directdebit: 'SEPA DE89 ****', creditcard: 'Visa ****', paypal: 'PayPal' }[method]} ${Math.floor(1000 + Math.random() * 9000)} (mock)`,
    });
  }
  await store<MockPayment>('payment', { ...payment, status: outcome, paidAt: outcome === 'paid' ? now : undefined, mandateId });
  await handlePaymentUpdate(paymentId);
  return payment.redirectUrl ?? '/';
}
