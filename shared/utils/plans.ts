import type { SpacePlan } from '../types/models';

export const spacePlans: Record<SpacePlan, { pricePerMonth: number }> = {
  free: { pricePerMonth: 0 },
  standard: { pricePerMonth: 39 },
  pro: { pricePerMonth: 99 },
};

export const spacePlanNames = Object.keys(spacePlans) as SpacePlan[];

export function isSpacePlan(plan: unknown): plan is SpacePlan {
  return typeof plan === 'string' && spacePlanNames.includes(plan as SpacePlan);
}

export const planLimits: Record<'users' | 'bookables' | 'bookings', Record<SpacePlan, number>> = {
  users: {
    free: 5,
    standard: 50,
    pro: 250,
  },
  bookables: {
    free: 3,
    standard: 50,
    pro: 250,
  },
  /** bookings per month */
  bookings: {
    free: 60,
    standard: Number.POSITIVE_INFINITY,
    pro: Number.POSITIVE_INFINITY,
  },
};

interface PlanState {
  plan: SpacePlan;
  activeUntil?: string | Date | null;
  currentPeriodEnd?: string | Date | null;
  scheduledPlan?: SpacePlan | null;
}

/** The plan of a space after a scheduled downgrade took effect (at the end of the paid period). */
export function getCurrentPlan(space: PlanState, now = new Date()): SpacePlan {
  if (space.scheduledPlan && space.currentPeriodEnd && new Date(space.currentPeriodEnd).getTime() <= now.getTime()) {
    return space.scheduledPlan;
  }
  return space.plan;
}

/**
 * The plan that is currently active for a space. A paid plan falls back to the
 * free plan as soon as `activeUntil` has passed (e.g. when a payment was rejected).
 */
export function getActivePlan(space: PlanState, now = new Date()): SpacePlan {
  if (getCurrentPlan(space, now) === 'free') {
    return 'free';
  }
  if (!space.activeUntil) {
    return 'free';
  }
  return new Date(space.activeUntil).getTime() > now.getTime() ? getCurrentPlan(space, now) : 'free';
}

/**
 * The net amount that is charged right away when upgrading during a paid period:
 * the price difference for the rest of the period (periods are one month long).
 */
export function proratedUpgradePrice(from: SpacePlan, to: SpacePlan, periodEnd: string | Date, now = new Date()): number {
  const end = new Date(periodEnd);
  const start = new Date(end);
  start.setUTCMonth(start.getUTCMonth() - 1);
  const fraction = Math.min(Math.max((end.getTime() - now.getTime()) / (end.getTime() - start.getTime()), 0), 1);
  const difference = spacePlans[to].pricePerMonth - spacePlans[from].pricePerMonth;
  return Math.max(Math.round(difference * fraction * 100) / 100, 0);
}
