import type { Buffer } from 'node:buffer';
import type { PaymentMethodType } from '#shared/types/models';

export interface ProviderMandate {
  id: string;
  method: PaymentMethodType;
  status: 'valid' | 'pending' | 'invalid';
  /** human readable name, e.g. the masked account number */
  name: string;
}

export type ProviderSubscriptionStatus = 'pending' | 'active' | 'canceled' | 'suspended' | 'completed';

export interface ProviderSubscription {
  id: string;
  status: ProviderSubscriptionStatus;
  /** `YYYY-MM-DD` */
  nextPaymentDate?: string;
}

export type ProviderPaymentStatus = 'open' | 'pending' | 'authorized' | 'paid' | 'failed' | 'canceled' | 'expired';

export interface ProviderPayment {
  id: string;
  status: ProviderPaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
  paidAt?: string;
  customerId?: string;
  subscriptionId?: string;
  sequenceType: 'oneoff' | 'first' | 'recurring';
  /** the mandate a paid first payment created (or a recurring payment used) */
  mandateId?: string;
  metadata?: Record<string, unknown>;
}

export interface CustomerInput {
  name: string;
  email: string;
  /** `de` or `en` */
  language: string;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionInput {
  /** gross amount per month */
  amount: number;
  currency: string;
  description: string;
  mandateId: string;
  webhookUrl: string;
  /** `YYYY-MM-DD`, first payment of the subscription (default: today) */
  startDate?: string;
  metadata?: Record<string, unknown>;
  /** the same key creates the subscription only once (e.g. when a webhook is retried) */
  idempotencyKey?: string;
}

export interface PaymentInput {
  /** gross amount */
  amount: number;
  currency: string;
  description: string;
  mandateId?: string;
  webhookUrl: string;
  metadata?: Record<string, unknown>;
}

export interface SalesInvoiceInput {
  recipient: {
    type: 'business' | 'consumer';
    organizationName?: string;
    vatNumber?: string;
    organizationNumber?: string;
    givenName?: string;
    familyName?: string;
    email: string;
    streetAndNumber: string;
    streetAdditional?: string;
    postalCode: string;
    city: string;
    /** ISO 3166-1 alpha-2 */
    country: string;
    /** `de` or `en` */
    language: string;
  };
  /** our id of the recipient (the user id) */
  recipientIdentifier: string;
  currency: string;
  vatRate: number;
  /** net amounts, the description has at most 100 characters */
  lines: { description: string; amount: number }[];
  /** net credit subtracted from the lines */
  discount?: number;
  /** the payment the invoice is already paid by */
  paymentId: string;
  email: { subject: string; body: string };
}

export interface ProviderSalesInvoice {
  id: string;
  number: string | null;
}

/**
 * The payment provider abstraction. There are two implementations: Mollie for production
 * and a mock that is used for local development and tests.
 */
export interface PaymentProvider {
  createCustomer: (data: CustomerInput) => Promise<string>;
  updateCustomer: (customerId: string, data: CustomerInput) => Promise<void>;
  listMandates: (customerId: string) => Promise<ProviderMandate[]>;
  revokeMandate: (customerId: string, mandateId: string) => Promise<void>;
  /**
   * starts a first payment the customer completes in the checkout, it creates a mandate (payment method);
   * an amount of 0 is only possible for credit card and PayPal (`methods`)
   */
  createMandateCheckout: (customerId: string, options: { amount: number; currency: string; description: string; redirectUrl: string; webhookUrl: string; language: string; metadata: Record<string, unknown>; methods?: ('creditcard' | 'paypal')[] }) => Promise<{ checkoutUrl: string }>;
  createSubscription: (customerId: string, data: SubscriptionInput) => Promise<ProviderSubscription>;
  updateSubscription: (customerId: string, subscriptionId: string, data: Partial<SubscriptionInput>) => Promise<ProviderSubscription>;
  cancelSubscription: (customerId: string, subscriptionId: string) => Promise<void>;
  getSubscription: (customerId: string, subscriptionId: string) => Promise<ProviderSubscription>;
  /** charges a one-off payment from an existing mandate of the customer (no checkout needed) */
  createRecurringPayment: (customerId: string, data: PaymentInput) => Promise<ProviderPayment>;
  /** issues an invoice for a paid payment, the provider numbers it and mails it to the recipient (idempotent per payment) */
  createSalesInvoice: (data: SalesInvoiceInput) => Promise<ProviderSalesInvoice>;
  getSalesInvoicePdf: (invoiceId: string) => Promise<Buffer>;
  getPayment: (paymentId: string) => Promise<ProviderPayment>;
}
