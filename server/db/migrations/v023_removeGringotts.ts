import type { Migration } from './index';

/**
 * v2 talks to Mollie directly instead of the gringotts payment service of v1. The gringotts ids are
 * removed, the billing data is migrated by the scripts in `scripts/gringotts` (the export runs
 * before v2 starts, so it keeps the link between the ids). Spaces keep their plan and `activeUntil`.
 */
export const v023_removeGringotts: Migration = {
  id: 'v023-remove-gringotts',
  async up(db) {
    await db.collection('spaces').updateMany({ subscription: { $exists: true } }, { $unset: { subscription: '' } });
    await db.collection('users').updateMany({ paymentCustomerId: { $exists: true } }, { $unset: { paymentCustomerId: '' } });
  },
};
