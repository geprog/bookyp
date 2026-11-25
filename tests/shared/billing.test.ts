// cspell:ignore Liddell Österreich
import { describe, expect, it } from 'vitest';
import { billingName, countryCode, isBillingComplete } from '../../shared/utils/billing';

const address = { addressLine1: 'Rabbit Hole 1', zipCode: '12345', city: 'Wonderland', country: 'DE' };
const business = { type: 'business' as const, organizationName: 'Wonderland GmbH', vatNumber: 'DE123456789', organizationNumber: '', givenName: '', familyName: '', ...address };
const consumer = { type: 'consumer' as const, organizationName: '', vatNumber: '', organizationNumber: '', givenName: 'Alice', familyName: 'Liddell', ...address };

describe('isBillingComplete', () => {
  it('needs the name and the VAT ID or commercial register number of a company', () => {
    expect(isBillingComplete(business)).toBe(true);
    expect(isBillingComplete({ ...business, vatNumber: '', organizationNumber: 'HRB 1234' })).toBe(true);
    expect(isBillingComplete({ ...business, vatNumber: '' })).toBe(false);
    expect(isBillingComplete({ ...business, organizationName: ' ' })).toBe(false);
  });

  it('needs first and last name of a private person', () => {
    expect(isBillingComplete(consumer)).toBe(true);
    expect(isBillingComplete({ ...consumer, familyName: 'L' })).toBe(false);
  });

  it('needs the address with a known country code', () => {
    expect(isBillingComplete({ ...business, city: '' })).toBe(false);
    expect(isBillingComplete({ ...business, country: 'Deutschland' })).toBe(false);
  });
});

describe('billing helpers', () => {
  it('addresses companies and private persons', () => {
    expect(billingName(business)).toBe('Wonderland GmbH');
    expect(billingName(consumer)).toBe('Alice Liddell');
  });

  it('finds the country code of German and English country names', () => {
    expect(countryCode('Deutschland')).toBe('DE');
    expect(countryCode(' germany ')).toBe('DE');
    expect(countryCode('Österreich')).toBe('AT');
    expect(countryCode('de')).toBe('DE');
    expect(countryCode('Narnia')).toBeUndefined();
  });
});
