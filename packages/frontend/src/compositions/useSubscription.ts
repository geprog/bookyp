import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import type { Ref } from 'vue';
import { computed } from 'vue';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useCurrentTime } from '~/compositions/useCurrentTime';
import useFind from '~/compositions/useFind';

const planLimits: Record<'bookings' | 'bookables' | 'users', Record<Model.SpacePlan, number>> = {
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
  bookings: {
    free: 60,
    standard: Number.POSITIVE_INFINITY,
    pro: Number.POSITIVE_INFINITY,
  },
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useSubscription(selectedDate: Ref<Date | undefined> | undefined = undefined) {
  const { currentSpace, spaceId } = useCurrentSpace();

  const currentPlan = computed(() => currentSpace.value?.plan || 'free');

  const currentPlanIsActive = computed(
    () => currentSpace.value?.activeUntil && dayjs(currentSpace.value?.activeUntil).isAfter(dayjs()),
  );

  const spaceMembers = computed(() => currentSpace.value?.members || []);

  const { data: invitations, isLoading: isLoadingInvitations } = useFind(
    'invitations',
    computed(() => (spaceId.value === null ? null : { paginate: false, query: { spaceId: spaceId.value } })),
  );

  const canAddNewUsers = computed(() => {
    if (isLoadingInvitations.value) {
      return true;
    }

    const currentUser = spaceMembers.value.length + invitations.value.length;
    if (currentPlanIsActive.value && currentUser <= planLimits.users[currentPlan.value]) {
      return true;
    }

    return currentUser < planLimits.users.free;
  });

  const { data: bookables, isLoading: isLoadingBookables } = useFind(
    'bookables',
    computed(() => ({ query: { space: spaceId.value } })),
  );

  const canAddNewBookables = computed(() => {
    if (isLoadingBookables.value) {
      return true;
    }

    if (currentPlanIsActive.value && bookables.value.length <= planLimits.bookables[currentPlan.value]) {
      return true;
    }

    return bookables.value.length < planLimits.bookables.free;
  });

  const { currentTime } = useCurrentTime();

  const { data: bookings, isLoading: isLoadingBookings } = useFind(
    'bookings',
    computed(() => ({
      query: {
        space: spaceId.value,
        // TODO: use actual subscription period based on anchor date
        start: {
          $gte: dayjs(selectedDate?.value ?? currentTime.value)
            .startOf('month')
            .toISOString(),
        },
        end: {
          $lte: dayjs(selectedDate?.value ?? currentTime.value)
            .endOf('month')
            .toISOString(),
        },
      },
    })),
  );

  const canAddNewBookings = computed(() => {
    if (isLoadingBookings.value) {
      return true;
    }

    if (currentPlanIsActive.value && bookings.value.length <= planLimits.bookings[currentPlan.value]) {
      return true;
    }

    return bookings.value.length < planLimits.bookings.free;
  });

  return { canAddNewUsers, canAddNewBookables, canAddNewBookings };
}
