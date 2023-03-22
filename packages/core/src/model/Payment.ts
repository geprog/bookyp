import {
  Customer as GringottsCustomer,
  Invoice as GringottsInvoice,
  PaymentMethod as GringottsPaymentMethod,
} from '@geprog/gringotts-client';

export type PaymentCustomer = GringottsCustomer;

export type PaymentMethod = GringottsPaymentMethod & { checkoutUrl?: string };

export type Invoice = GringottsInvoice;

export type InvoiceDownload = { url: string };
