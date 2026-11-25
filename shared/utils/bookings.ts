import type { BookingOrRequest } from '../types/models';

/**
 * Whether a booking in a space with the given settings has to be a request that an admin confirms.
 * - `bookings`: never
 * - `requests`: always
 * - `both`: only for users that are not members of a public space
 * - `only_info`: bookings are not possible at all (returns `null`)
 */
export function requiresRequest(space: { bookingsAndRequests?: BookingOrRequest; isPublic?: boolean }, isMember: boolean): boolean | null {
  const mode = space.bookingsAndRequests ?? 'bookings';
  if (mode === 'only_info') {
    return null;
  }
  if (mode === 'requests') {
    return true;
  }
  return mode === 'both' && !!space.isPublic && !isMember;
}
