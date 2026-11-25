import type { PaymentCustomer } from '../types/models';

/** countries invoices can be sent to (ISO 3166-1 alpha-2), the names come from `Intl.DisplayNames` */
export const billingCountries = [
  'DE',
  'AT',
  'CH',
  'LI',
  'LU',
  'NL',
  'BE',
  'FR',
  'IT',
  'ES',
  'PT',
  'IE',
  'DK',
  'SE',
  'FI',
  'NO',
  'IS',
  'PL',
  'CZ',
  'SK',
  'HU',
  'SI',
  'HR',
  'RO',
  'BG',
  'GR',
  'CY',
  'MT',
  'EE',
  'LV',
  'LT',
  'GB',
  'US',
] as const;

export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  }
  catch {
    return code;
  }
}

/** finds the country code of a country name written in German or English (e.g. "Deutschland" or "Germany") */
export function countryCode(name: string): string | undefined {
  const value = name.trim().toLowerCase();
  if (!value) {
    return undefined;
  }
  return billingCountries.find(code => code.toLowerCase() === value
    || ['de', 'en'].some(locale => countryName(code, locale).toLowerCase() === value));
}

type BillingDetails = Pick<PaymentCustomer, 'type' | 'organizationName' | 'vatNumber' | 'organizationNumber' | 'givenName' | 'familyName' | 'addressLine1' | 'zipCode' | 'city' | 'country'>;

/** the name invoices are addressed to */
export function billingName(customer: BillingDetails): string {
  return customer.type === 'business'
    ? customer.organizationName.trim()
    : `${customer.givenName.trim()} ${customer.familyName.trim()}`.trim();
}

/** whether everything an invoice needs is there (name, tax id of companies, address) */
export function isBillingComplete(customer: BillingDetails): boolean {
  const identity = customer.type === 'business'
    ? !!customer.organizationName.trim() && !!(customer.vatNumber.trim() || customer.organizationNumber.trim())
    : customer.givenName.trim().length >= 2 && customer.familyName.trim().length >= 2;
  return identity
    && !!customer.addressLine1.trim()
    && !!customer.zipCode.trim()
    && !!customer.city.trim()
    && (billingCountries as readonly string[]).includes(customer.country);
}
