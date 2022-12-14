<template>
  <SpaceBookingsHeader />

  <AppContent>
    <h2 class="font-bold mt-4">{{ t('bookings_of', { name: spaceMember?.name }) }}</h2>

    <div>
      <router-link
        v-for="booking in sortedBookings"
        :key="booking._id"
        :to="{ name: 'account-booking', params: { bookingId: booking._id } }"
      >
        <ListItem class="my-3">
          <template #start>
            <!-- disable orange bar -->
            <div />
          </template>
          <div v-if="booking" class="text-gray-500 text-sm gap-1 w-full">
            <div class="w-full flex justify-between">
              <span> {{ t('booked') }}:</span>
              <span>{{ booking.bookable?.name }}</span>
            </div>
            <div class="w-full flex justify-between">
              <span> {{ t('start') }}:</span>
              <span>{{ booking.start }}</span>
            </div>
            <div class="w-full flex justify-between">
              <span>{{ t('end') }}:</span>
              <span>{{ booking.end }}</span>
            </div>
            <div class="w-full flex justify-between">
              <span>{{ t('hours') }}:</span>
              <span>{{ booking.duration }}</span>
            </div>
          </div>
        </ListItem>
      </router-link>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import SpaceBookingsHeader from '~/components/headers/SpaceBookingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

const { t } = useI18n();
const { spaceId } = useCurrentSpace();

const props = defineProps<{
  spaceMemberId: string;
}>();

const spaceMemberId = toRef(props, 'spaceMemberId');

const { data: spaceMember } = useGet('users', spaceMemberId);

const bookingsQuery = computed(() => ({
  query: {
    spaceId: spaceId.value,
    bookedBy: spaceMemberId.value,
  },
}));

const { data: bookings } = useFind('bookings', bookingsQuery);

const bookableIds = computed(() =>
  Array.from(
    bookings.value
      .reduce((acc, booking) => {
        acc.add(booking.bookable);
        return acc;
      }, new Set<string>())
      .values(),
  ),
);

const { data: bookables } = useFind(
  'bookables',
  computed(() => ({
    query: {
      spaceId: spaceId.value,
      _id: { $in: bookableIds.value },
    },
  })),
);

const sortedBookings = computed(() =>
  [...bookings.value]
    .sort((a, b) => (dayjs(b.start).isBefore(a.start) ? -1 : 1))
    .map((booking) => ({
      ...booking,
      start: dayjs(booking.start).format('ddd, DD. MMM. YYYY - HH:mm'),
      end: dayjs(booking?.end).format('ddd, DD. MMM. YYYY - HH:mm'),
      duration: dayjs.duration(dayjs(booking.end).diff(dayjs(booking.start))).format('H:mm'),
      bookable: bookables.value.find((i) => i._id === booking.bookable),
    })),
);
</script>
