import type { Ref } from 'vue';
import type { Bookable, Booking, ForeignBooking } from '#shared/types/models';
import dayjs from 'dayjs';
import { ceilToMinutes } from '#shared/utils/dates';

export type BookableWithFilterMatched = Bookable & { isFilterMatched: boolean };

/**
 * The bookables of a space together with the bookings in the selected time range
 * (the date filter, or by default the next two hours), so the availability of every bookable is known.
 */
export function useBookables(spaceId: Ref<string | undefined | null>, options: { includeDeleted?: boolean } = {}) {
  const { user } = useAuth();
  const { dateFilter, resetDateFilter } = useDateFilter();
  const now = useNow({ interval: 60_000 });

  const defaultFilter = computed(() => {
    const start = ceilToMinutes(now.value, 15);
    return { start, end: dayjs(start).add(2, 'hours').toDate() };
  });

  const combinedFilter = computed(() => ({
    start: dateFilter.value.start ?? defaultFilter.value.start,
    end: dateFilter.value.end ?? defaultFilter.value.end,
  }));

  const { data: bookables, pending: pendingBookables, loading: loadingBookables } = usePolling(
    () => `bookables:${spaceId.value}:${options.includeDeleted ? 'all' : 'active'}`,
    async () => (spaceId.value
      ? await $fetch<Bookable[]>(`/api/spaces/${spaceId.value}/bookables`, { query: options.includeDeleted ? { includeDeleted: 'true' } : {} })
      : []),
    { watch: [spaceId], default: () => [] },
  );

  const { data: bookings, pending: pendingBookings, loading: loadingBookings } = usePolling(
    () => `bookings:${spaceId.value}:filter`,
    async () => (spaceId.value
      ? await $fetch<(Booking | ForeignBooking)[]>('/api/bookings', {
          query: { space: spaceId.value, from: combinedFilter.value.start.toISOString(), to: combinedFilter.value.end.toISOString() },
        })
      : []),
    { watch: [spaceId, combinedFilter], default: () => [] },
  );

  const pending = computed(() => pendingBookables.value || pendingBookings.value);
  const loading = computed(() => loadingBookables.value || loadingBookings.value);

  const occupiedBookableIds = computed(() => new Set((bookings.value ?? []).map(booking => booking.bookable)));

  const bookablesWithFilterMatched = computed<BookableWithFilterMatched[]>(() =>
    (bookables.value ?? [])
      .filter(bookable => !bookable.deleted)
      .map(bookable => ({ ...bookable, isFilterMatched: !occupiedBookableIds.value.has(bookable._id) })),
  );

  const userBookings = computed(() =>
    (bookings.value ?? []).filter((booking): booking is Booking => 'bookedBy' in booking && booking.bookedBy === user.value?._id),
  );

  const isFilterMatched = (bookableId?: string) => !!bookableId && !occupiedBookableIds.value.has(bookableId);
  const isBookedByMe = (bookableId?: string) => !!bookableId && userBookings.value.some(booking => booking.bookable === bookableId);
  const isRequestedByMe = (bookableId?: string) => !!bookableId && userBookings.value.some(booking => booking.bookable === bookableId && booking.request);
  const isRequested = (bookableId?: string) => !!bookableId && (bookings.value ?? []).some(booking => booking.bookable === bookableId && booking.request);

  return {
    bookables,
    bookings,
    pending,
    loading,
    dateFilter,
    combinedFilter,
    bookablesWithFilterMatched,
    isFilterMatched,
    isBookedByMe,
    isRequested,
    isRequestedByMe,
    resetBookablesFilter: resetDateFilter,
  };
}
