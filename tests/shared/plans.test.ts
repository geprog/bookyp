import { describe, expect, it } from 'vitest';
import { getActivePlan, getCurrentPlan, isSpacePlan, planLimits, proratedUpgradePrice } from '../../shared/utils/plans';

describe('getActivePlan', () => {
  const now = new Date('2026-10-17T12:00:00Z');

  it('is free for the free plan', () => {
    expect(getActivePlan({ plan: 'free' }, now)).toBe('free');
  });

  it('is the paid plan while it is active', () => {
    expect(getActivePlan({ plan: 'standard', activeUntil: '2026-11-01T00:00:00Z' }, now)).toBe('standard');
    expect(getActivePlan({ plan: 'pro', activeUntil: new Date('2026-10-17T12:00:01Z') }, now)).toBe('pro');
  });

  it('falls back to free when the paid plan expired or never got activated', () => {
    expect(getActivePlan({ plan: 'standard', activeUntil: '2026-10-01T00:00:00Z' }, now)).toBe('free');
    expect(getActivePlan({ plan: 'pro' }, now)).toBe('free');
    expect(getActivePlan({ plan: 'pro', activeUntil: null }, now)).toBe('free');
  });
});

describe('scheduled plan changes', () => {
  const now = new Date('2026-10-17T12:00:00Z');
  const space = { plan: 'pro' as const, activeUntil: '2026-11-27T00:00:00Z', currentPeriodEnd: '2026-11-20T00:00:00Z' };

  it('keeps the paid plan until the end of the period', () => {
    expect(getCurrentPlan({ ...space, scheduledPlan: 'standard' }, now)).toBe('pro');
    expect(getActivePlan({ ...space, scheduledPlan: 'free' }, now)).toBe('pro');
  });

  it('switches to the scheduled plan at the end of the period', () => {
    const later = new Date('2026-11-20T00:00:00Z');
    expect(getActivePlan({ ...space, scheduledPlan: 'standard' }, later)).toBe('standard');
    expect(getActivePlan({ ...space, scheduledPlan: 'free' }, later)).toBe('free');
  });
});

describe('proratedUpgradePrice', () => {
  it('charges the price difference for the rest of the period', () => {
    // 15 of 30 days left, (99 - 39) / 2
    expect(proratedUpgradePrice('standard', 'pro', '2026-12-16T00:00:00Z', new Date('2026-12-01T00:00:00Z'))).toBe(30);
    expect(proratedUpgradePrice('free', 'standard', '2026-11-16T00:00:00Z', new Date('2026-10-16T00:00:00Z'))).toBe(39);
  });

  it('charges nothing for downgrades or after the period', () => {
    expect(proratedUpgradePrice('pro', 'standard', '2026-11-16T00:00:00Z', new Date('2026-11-01T00:00:00Z'))).toBe(0);
    expect(proratedUpgradePrice('standard', 'pro', '2026-11-16T00:00:00Z', new Date('2026-11-17T00:00:00Z'))).toBe(0);
  });
});

describe('plan helpers', () => {
  it('knows the plan names', () => {
    expect(isSpacePlan('free')).toBe(true);
    expect(isSpacePlan('enterprise')).toBe(false);
    expect(isSpacePlan(undefined)).toBe(false);
  });

  it('has unlimited bookings for paid plans', () => {
    expect(planLimits.bookings.free).toBe(60);
    expect(planLimits.bookings.standard).toBe(Number.POSITIVE_INFINITY);
  });
});
