import { describe, expect, it } from 'vitest';
import { requiresRequest } from '../../shared/utils/bookings';
import { ceilToMinutes, overlaps } from '../../shared/utils/dates';

describe('requiresRequest', () => {
  it('never requires a request in booking mode', () => {
    expect(requiresRequest({ bookingsAndRequests: 'bookings', isPublic: true }, false)).toBe(false);
    expect(requiresRequest({}, false)).toBe(false);
  });

  it('always requires a request in request mode', () => {
    expect(requiresRequest({ bookingsAndRequests: 'requests' }, true)).toBe(true);
  });

  it('requires a request for guests of public spaces in mixed mode', () => {
    expect(requiresRequest({ bookingsAndRequests: 'both', isPublic: true }, false)).toBe(true);
    expect(requiresRequest({ bookingsAndRequests: 'both', isPublic: true }, true)).toBe(false);
    expect(requiresRequest({ bookingsAndRequests: 'both', isPublic: false }, false)).toBe(false);
  });

  it('does not allow bookings in info only mode', () => {
    expect(requiresRequest({ bookingsAndRequests: 'only_info' }, true)).toBeNull();
  });
});

describe('dates', () => {
  it('rounds up to the next quarter of an hour', () => {
    expect(ceilToMinutes(new Date('2026-10-17T14:52:10Z'), 15).toISOString()).toBe('2026-10-17T15:00:00.000Z');
    expect(ceilToMinutes(new Date('2026-10-17T15:00:00Z'), 15).toISOString()).toBe('2026-10-17T15:15:00.000Z');
  });

  it('detects overlapping ranges', () => {
    const a = { start: '2026-10-17T10:00:00Z', end: '2026-10-17T12:00:00Z' };
    expect(overlaps(a, { start: '2026-10-17T11:00:00Z', end: '2026-10-17T13:00:00Z' })).toBe(true);
    expect(overlaps(a, { start: '2026-10-17T12:00:00Z', end: '2026-10-17T13:00:00Z' })).toBe(false);
    expect(overlaps(a, { start: '2026-10-17T08:00:00Z', end: '2026-10-17T10:00:00Z' })).toBe(false);
  });
});
