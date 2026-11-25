import type { DbInvitation, DbSpace } from './dbTypes';
import dayjs from 'dayjs';
import { getActivePlan, planLimits } from '#shared/utils/plans';

/**
 * Checks whether another member (or invitation) fits into the plan of the space. Pending invitations hold a place,
 * a domain invitation only one, so `accepting` (the domain invitation a user accepts) is checked again on every accept.
 */
export async function assertCanAddMember(space: DbSpace, accepting?: Pick<DbInvitation, '_id'>): Promise<void> {
  const { invitations } = await useCollections();
  const pending = await invitations.countDocuments({ spaceId: space._id.toString(), ...(accepting ? { _id: { $ne: accepting._id } } : {}) });
  const current = (space.members?.length ?? 0) + pending;
  if (current >= planLimits.users[getActivePlan(space)]) {
    // the invitee can not upgrade the plan, they get told that the space is full
    apiError(403, accepting ? 'space_full' : 'members_limit_reached', 'Adding new members not allowed');
  }
}

export async function assertCanAddBookable(space: DbSpace): Promise<void> {
  const { bookables } = await useCollections();
  const current = await bookables.countDocuments({ space: space._id.toString(), deleted: { $ne: true } });
  if (current >= planLimits.bookables[getActivePlan(space)]) {
    apiError(403, 'bookables_limit_reached', 'Adding new bookables not allowed');
  }
}

/**
 * Checks whether another booking in the month of `start` fits into the plan of the space.
 * `excludeBookingId` is a booking that is moved, it does not count against the limit.
 */
export async function assertCanAddBooking(space: DbSpace, start: Date, excludeBookingId?: string): Promise<void> {
  const limit = planLimits.bookings[getActivePlan(space)];
  if (!Number.isFinite(limit)) {
    return;
  }
  const { bookings } = await useCollections();
  const current = await bookings.countDocuments({
    ...(excludeBookingId ? { _id: { $ne: toObjectId(excludeBookingId) } } : {}),
    space: space._id.toString(),
    deleted: { $ne: true },
    start: { $gte: dayjs(start).startOf('month').toDate(), $lte: dayjs(start).endOf('month').toDate() },
  });
  if (current >= limit) {
    apiError(403, 'bookings_limit_reached', 'No more bookings available in this month');
  }
}
