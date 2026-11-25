import type { ListMandateResponse, MandateResponse, PaymentResponse, SalesInvoiceRequest, SubscriptionResponse } from 'mollie-api-typescript/models';
import type { PaymentMethodType } from '#shared/types/models';
import type { PaymentProvider, ProviderMandate, ProviderPayment, ProviderPaymentStatus, ProviderSubscription, ProviderSubscriptionStatus } from './provider';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { Client } from 'mollie-api-typescript';

function toLocale(language: string): 'de_DE' | 'en_US' {
  return language === 'de' ? 'de_DE' : 'en_US';
}

function toAmount(amount: number, currency: string): { value: string; currency: string } {
  return { value: amount.toFixed(2), currency };
}

function toMetadata(metadata: unknown): Record<string, unknown> | undefined {
  return metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata as Record<string, unknown> : undefined;
}

function mandateName(mandate: MandateResponse | ListMandateResponse): string {
  const { details } = mandate;
  switch (mandate.method) {
    case 'directdebit':
      return `SEPA ${details?.consumerAccount ?? ''}`.trim();
    case 'creditcard':
      return `${details?.cardLabel ?? 'Card'} ${details?.cardNumber ?? ''}`.trim();
    case 'paypal':
      return `PayPal ${details?.consumerAccount ?? ''}`.trim();
    default:
      return String(mandate.method);
  }
}

function toMandate(mandate: MandateResponse | ListMandateResponse): ProviderMandate {
  return {
    id: mandate.id,
    method: mandate.method as PaymentMethodType,
    status: mandate.status as ProviderMandate['status'],
    name: mandateName(mandate),
  };
}

function toSubscription(subscription: SubscriptionResponse): ProviderSubscription {
  return {
    id: subscription.id,
    status: subscription.status as ProviderSubscriptionStatus,
    nextPaymentDate: subscription.nextPaymentDate ?? undefined,
  };
}

function toPayment(payment: PaymentResponse): ProviderPayment {
  return {
    id: payment.id,
    status: payment.status as ProviderPaymentStatus,
    amount: Number.parseFloat(payment.amount.value),
    currency: payment.amount.currency,
    createdAt: payment.createdAt,
    paidAt: payment.paidAt ?? undefined,
    customerId: payment.customerId,
    subscriptionId: payment.subscriptionId ?? undefined,
    sequenceType: payment.sequenceType as ProviderPayment['sequenceType'],
    mandateId: payment.mandateId ?? undefined,
    metadata: toMetadata(payment.metadata),
  };
}

export function createMollieProvider(apiKey: string): PaymentProvider {
  const mollie = new Client({ security: { apiKey } });

  return {
    async createCustomer(data) {
      const customer = await mollie.customers.create({ entityCustomer: { name: data.name, email: data.email, locale: toLocale(data.language), metadata: data.metadata } });
      return customer.id;
    },

    async updateCustomer(customerId, data) {
      await mollie.customers.update({ customerId, requestBody: { name: data.name, email: data.email, locale: toLocale(data.language), metadata: data.metadata } });
    },

    async listMandates(customerId) {
      const mandates: ProviderMandate[] = [];
      for await (const page of await mollie.mandates.list({ customerId, limit: 250 })) {
        mandates.push(...page.result.embedded.mandates.map(toMandate));
      }
      return mandates;
    },

    async revokeMandate(customerId, mandateId) {
      await mollie.mandates.revoke({ customerId, mandateId });
    },

    async createMandateCheckout(customerId, options) {
      const payment = await mollie.customers.createPayment({
        customerId,
        paymentRequest: {
          amount: toAmount(options.amount, options.currency),
          description: options.description,
          sequenceType: 'first',
          ...(options.methods ? { method: options.methods } : {}),
          redirectUrl: options.redirectUrl,
          webhookUrl: options.webhookUrl,
          locale: toLocale(options.language),
          metadata: options.metadata,
        },
      });
      const checkoutUrl = payment.links.checkout?.href;
      if (!checkoutUrl) {
        throw createError({ statusCode: 502, statusMessage: 'Mollie did not return a checkout url' });
      }
      return { checkoutUrl };
    },

    async createSubscription(customerId, data) {
      const subscription = await mollie.subscriptions.create({
        customerId,
        idempotencyKey: data.idempotencyKey,
        subscriptionRequest: {
          amount: toAmount(data.amount, data.currency),
          interval: '1 month',
          description: data.description,
          mandateId: data.mandateId,
          webhookUrl: data.webhookUrl,
          ...(data.startDate ? { startDate: data.startDate } : {}),
          metadata: data.metadata,
        },
      });
      return toSubscription(subscription);
    },

    async updateSubscription(customerId, subscriptionId, data) {
      const subscription = await mollie.subscriptions.update({
        customerId,
        subscriptionId,
        requestBody: {
          ...(data.amount !== undefined && data.currency ? { amount: toAmount(data.amount, data.currency) } : {}),
          ...(data.description ? { description: data.description } : {}),
          ...(data.mandateId ? { mandateId: data.mandateId } : {}),
          ...(data.metadata ? { metadata: data.metadata } : {}),
        },
      });
      return toSubscription(subscription);
    },

    async cancelSubscription(customerId, subscriptionId) {
      await mollie.subscriptions.cancel({ customerId, subscriptionId });
    },

    async getSubscription(customerId, subscriptionId) {
      return toSubscription(await mollie.subscriptions.get({ customerId, subscriptionId }));
    },

    async createRecurringPayment(customerId, data) {
      const payment = await mollie.customers.createPayment({
        customerId,
        paymentRequest: {
          amount: toAmount(data.amount, data.currency),
          description: data.description,
          sequenceType: 'recurring',
          ...(data.mandateId ? { mandateId: data.mandateId } : {}),
          webhookUrl: data.webhookUrl,
          metadata: data.metadata,
        },
      });
      return toPayment(payment);
    },

    async createSalesInvoice(data) {
      const { recipient } = data;
      const salesInvoiceRequest: SalesInvoiceRequest = {
        status: 'paid',
        recipientIdentifier: data.recipientIdentifier,
        recipient: {
          type: recipient.type,
          ...(recipient.type === 'business'
            ? { organizationName: recipient.organizationName, vatNumber: recipient.vatNumber || null, organizationNumber: recipient.organizationNumber || null }
            : { givenName: recipient.givenName, familyName: recipient.familyName }),
          email: recipient.email,
          streetAndNumber: recipient.streetAndNumber,
          streetAdditional: recipient.streetAdditional || null,
          postalCode: recipient.postalCode,
          city: recipient.city,
          country: recipient.country,
          locale: toLocale(recipient.language),
        },
        vatMode: 'exclusive',
        lines: data.lines.map(line => ({ description: line.description, quantity: 1, vatRate: data.vatRate.toFixed(2), unitPrice: toAmount(line.amount, data.currency) })),
        ...(data.discount ? { discount: { type: 'amount', value: data.discount.toFixed(2) } } : {}),
        paymentDetails: { source: 'payment', sourceReference: data.paymentId },
        emailDetails: data.email,
      };
      // the same invoice (e.g. from a retried webhook) is only issued once, while a retry with changed
      // billing details needs a new key (Mollie refuses a key that was used with other contents)
      const contentHash = createHash('sha256').update(JSON.stringify(salesInvoiceRequest)).digest('hex').slice(0, 16);
      const invoice = await mollie.salesInvoices.create({ idempotencyKey: `sales-invoice-${data.paymentId}-${contentHash}`, salesInvoiceRequest });
      return { id: invoice.id, number: invoice.invoiceNumber ?? null };
    },

    async getSalesInvoicePdf(invoiceId) {
      const invoice = await mollie.salesInvoices.get({ salesInvoiceId: invoiceId });
      const href = invoice.links?.pdfLink?.href;
      if (!href) {
        throw createError({ statusCode: 404, statusMessage: 'The pdf of the invoice is not generated yet' });
      }
      // the link points to the api (needs the key) or to a signed download url
      const isApi = new URL(href).hostname === 'api.mollie.com';
      const pdf = await $fetch<ArrayBuffer>(href, { responseType: 'arrayBuffer', headers: isApi ? { Authorization: `Bearer ${apiKey}` } : {} });
      return Buffer.from(pdf);
    },

    async getPayment(paymentId) {
      return toPayment(await mollie.payments.get({ paymentId }));
    },
  };
}
