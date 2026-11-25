import dayjs from 'dayjs';

/** whether the user has a booking running right now (shown as dot on the bookings menu entry) */
export function useOngoingBookings() {
  const { user } = useAuth();
  const now = useNow({ interval: 60_000 });

  const { data } = usePolling(
    'ongoing-bookings',
    async () => {
      if (!user.value) {
        return [];
      }
      return await $fetch<{ start: string; end: string; request?: boolean }[]>('/api/bookings', {
        query: { bookedBy: 'me', from: now.value.toISOString(), to: now.value.toISOString() },
      });
    },
    { watch: [user], default: () => [], interval: 60_000 },
  );

  const hasOngoingBooking = computed(() =>
    (data.value ?? []).some(booking => !booking.request && dayjs(booking.start).isBefore(now.value) && dayjs(booking.end).isAfter(now.value)),
  );

  return { hasOngoingBooking };
}
