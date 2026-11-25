import type { Ref } from 'vue';
import type { Booking, ForeignBooking } from '#shared/types/models';
import dayjs from 'dayjs';
import { getActivePlan, planLimits } from '#shared/utils/plans';

/**
 * Client side view of the plan limits of the current space (members, bookables, bookings per month),
 * used to show hints before the server rejects an action.
 */
export function useSubscriptionLimits(spaceId: Ref<string>, options: { bookingMonth?: Ref<Date | undefined> } = {}) {
  const { currentSpace, isAdmin } = useCurrentSpaceState();
  const now = useNow({ interval: 60_000 });

  const activePlan = computed(() => (currentSpace.value ? getActivePlan(currentSpace.value) : 'free'));
  const isPlanActive = computed(() => !!currentSpace.value?.activeUntil && dayjs(currentSpace.value.activeUntil).isAfter(now.value));

  const month = computed(() => dayjs(options.bookingMonth?.value ?? now.value));
  const { data: monthBookings, pending: pendingBookings } = usePolling(
    () => `bookings:${spaceId.value}:month:${month.value.format('YYYY-MM')}`,
    () => $fetch<(Booking | ForeignBooking)[]>('/api/bookings', {
      query: { space: spaceId.value, from: month.value.startOf('month').toISOString(), to: month.value.endOf('month').toISOString() },
    }),
    { watch: [spaceId, month], default: () => [] },
  );

  const canAddNewBookings = computed(() => pendingBookings.value || (monthBookings.value?.length ?? 0) < planLimits.bookings[activePlan.value]);

  return { activePlan, isPlanActive, isAdmin, canAddNewBookings, planLimits };
}
