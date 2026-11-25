import type { H3Event } from 'h3';
import type { Booking, ForeignBooking, PublicUser } from '#shared/types/models';
import type { SpaceAccess } from './access';
import type { DbBooking, DbSpace, DbUser } from './dbTypes';
import type { CurrentUser } from './session';
import { requiresRequest } from '#shared/utils/bookings';

export function serializeBooking(booking: DbBooking, bookedByUser?: PublicUser): Booking {
  return {
    _id: booking._id.toString(),
    start: booking.start.toISOString(),
    end: booking.end.toISOString(),
    bookedBy: booking.bookedBy,
    bookable: booking.bookable,
    description: booking.description,
    space: booking.space,
    request: booking.request,
    deleted: booking.deleted,
    bookedByUser,
  };
}

/** the subset of a booking users that did not book it are allowed to see */
export function serializeForeignBooking(booking: DbBooking): ForeignBooking {
  return {
    _id: booking._id.toString(),
    start: booking.start.toISOString(),
    end: booking.end.toISOString(),
    bookable: booking.bookable,
    space: booking.space,
    request: booking.request,
  };
}

export function canSeeBookingDetails(booking: DbBooking, user: CurrentUser | undefined, access: SpaceAccess): boolean {
  return access === 'admin' || (!!user && booking.bookedBy === user._id);
}

export async function loadPublicUsers(userIds: string[]): Promise<Map<string, PublicUser>> {
  const ids = [...new Set(userIds)].filter(isValidId);
  if (ids.length === 0) {
    return new Map();
  }
  const { users } = await useCollections();
  const docs = await users.find({ _id: { $in: ids.map(id => toObjectId(id)) } }).toArray();
  return new Map(docs.map(doc => [doc._id.toString(), { _id: doc._id.toString(), email: doc.email, name: doc.name }]));
}

/** Serializes bookings for a viewer: full details for admins and own bookings, a reduced version for everything else. */
export async function serializeBookingsFor(bookings: DbBooking[], user: CurrentUser | undefined, access: SpaceAccess): Promise<(Booking | ForeignBooking)[]> {
  const detailed = bookings.filter(booking => canSeeBookingDetails(booking, user, access));
  const users = await loadPublicUsers(detailed.map(booking => booking.bookedBy));
  return bookings.map(booking =>
    canSeeBookingDetails(booking, user, access)
      ? serializeBooking(booking, users.get(booking.bookedBy))
      : serializeForeignBooking(booking),
  );
}

/**
 * Whether a booking in the space has to be a request that is confirmed by an admin first.
 * Throws when the space does not allow bookings at all.
 */
export function isRequestBooking(space: DbSpace, bookedBy: string): boolean {
  const isMember = space.members.some(member => member.userId === bookedBy);
  const request = requiresRequest(space, isMember);
  if (request === null) {
    apiError(403, 'bookings_not_allowed', 'Bookings and requests are not allowed for this space');
  }
  return request;
}

/** like v1 only an end before the start is rejected (a booking may be zero-length) */
export function assertValidRange(start: Date, end: Date): void {
  if (end < start) {
    apiError(400, 'booking_invalid_end_date', 'End date must be after start date');
  }
}

export async function assertNoOverlap(bookableId: string, start: Date, end: Date, excludeBookingId?: string): Promise<void> {
  const { bookings } = await useCollections();
  const overlapping = await bookings.countDocuments({
    ...(excludeBookingId ? { _id: { $ne: toObjectId(excludeBookingId) } } : {}),
    bookable: bookableId,
    deleted: { $ne: true },
    start: { $lt: end },
    end: { $gt: start },
  });
  if (overlapping > 0) {
    apiError(409, 'booking_overlaps', 'Booking overlaps with existing bookings');
  }
}

/** Loads a booking (deleted ones included) and checks that the user may see its details. */
export async function requireBookingDetails(event: H3Event, bookingId: string | undefined): Promise<{ booking: DbBooking; space: DbSpace; user: CurrentUser; access: SpaceAccess }> {
  const user = await requireUser(event);
  const { bookings } = await useCollections();
  const booking = await bookings.findOne({ _id: toObjectId(bookingId) });
  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' });
  }
  const space = await loadSpace(booking.space, { includeDeleted: true });
  const access = getSpaceAccess(space, user);
  if (!canSeeBookingDetails(booking, user, access)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  return { booking, space, user, access };
}

export async function loadBookingContext(booking: DbBooking): Promise<{ bookable: DbBookable; bookedBy: DbUser | null }> {
  const { bookables, users } = await useCollections();
  const bookable = await bookables.findOne({ _id: toObjectId(booking.bookable) });
  if (!bookable) {
    throw createError({ statusCode: 404, statusMessage: 'Bookable not found' });
  }
  const bookedBy = isValidId(booking.bookedBy) ? await users.findOne({ _id: toObjectId(booking.bookedBy) }) : null;
  return { bookable, bookedBy };
}

type DbBookable = import('./dbTypes').DbBookable;
