import { z } from 'zod';
import { billingCountries, isBillingComplete } from '#shared/utils/billing';

const text = (max: number) => z.string().trim().max(max).default('');

export const paymentCustomerSchema = z.object({
  type: z.enum(['business', 'consumer']).default('business'),
  organizationName: text(200),
  vatNumber: text(50),
  organizationNumber: text(50),
  givenName: text(100),
  familyName: text(100),
  email: z.union([emailSchema, z.literal('')]).default(''),
  addressLine1: text(200),
  addressLine2: text(200),
  zipCode: text(20),
  city: text(100),
  country: z.enum(billingCountries),
  language: z.enum(['de', 'en']).default('en'),
  activePaymentMethod: z.string().max(100).nullable().optional(),
}).refine(isBillingComplete, 'Billing details are incomplete');
