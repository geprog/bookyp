import { describe, expect, it } from 'vitest';
import { gringottsPeriodPrice } from '../../scripts/gringotts/common';

describe('gringottsPeriodPrice', () => {
  const start = new Date('2026-10-01T00:00:00Z');
  const end = new Date('2026-10-31T00:00:00Z');

  it('charges the full price without changes in the period', () => {
    expect(gringottsPeriodPrice([{ start: new Date('2026-01-15T00:00:00Z'), end: null, pricePerUnit: 39, units: 1 }], start, end)).toBe(39);
  });

  it('charges every plan for the share of the period it was active', () => {
    const changes = [
      { start: new Date('2026-01-15T00:00:00Z'), end: null, pricePerUnit: 39, units: 1 },
      { start: new Date('2026-10-16T00:00:00Z'), end: null, pricePerUnit: 99, units: 1 },
    ];
    // 15 of 30 days standard, 15 days pro
    expect(gringottsPeriodPrice(changes, start, end)).toBe(69);
  });
});
