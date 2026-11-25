<template>
  <AppContent class="flex flex-col">
    <h2 class="mt-4 font-bold">
      {{ t('bookings_of', { name: memberName }) }}
    </h2>
    <Spinner v-if="loading" />
    <ListItem v-for="booking in sortedBookings" :key="booking._id" class="my-3" :to="`/account/booking/${booking._id}`">
      <template #start>
        <div />
      </template>
      <div class="w-full gap-1 text-sm text-gray-500">
        <div class="flex w-full justify-between">
          <span>{{ t('booked') }}:</span><span>{{ bookableLookup.get(booking.bookable)?.name }}</span>
        </div>
        <div class="flex w-full justify-between">
          <span>{{ t('start') }}:</span><span>{{ dayjs(booking.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
        </div>
        <div class="flex w-full justify-between">
          <span>{{ t('end') }}:</span><span>{{ dayjs(booking.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
        </div>
        <div class="flex w-full justify-between">
          <span>{{ t('hours') }}:</span><span>{{ dayjs.duration(dayjs(booking.end).diff(dayjs(booking.start))).format('H:mm') }}</span>
        </div>
      </div>
    </ListItem>
  </AppContent>
</template>

<script setup lang="ts">
import type { Booking } from '#shared/types/models';
import dayjs from 'dayjs';

const { t } = useI18n();
const route = useRoute();
const { space, spaceId } = useCurrentSpace();

useAppHeader(() => ({ menu: 'none', title: t('bookings'), back: `/space/${spaceId.value}/bookings/members` }));

const memberId = computed(() => route.params.spaceMemberId as string);

const { data: bookings, loading } = usePolling(
  () => `bookings:${spaceId.value}:all`,
  () => $fetch<Booking[]>('/api/bookings', { query: { space: spaceId.value } }),
  { watch: [spaceId], default: () => [] },
);

const memberBookings = computed(() => (bookings.value ?? []).filter(b => b.bookedBy === memberId.value));
// the name comes from a booking, or from the members of the space when the member has no bookings
const memberName = computed(() => {
  const user = memberBookings.value[0]?.bookedByUser ?? (isFullSpace(space.value) ? space.value.members.find(m => m.userId === memberId.value) : undefined);
  return user?.name || user?.email || '';
});
const sortedBookings = computed(() => [...memberBookings.value].sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf()));

const bookableIds = computed(() => memberBookings.value.map(b => b.bookable));
const bookableLookup = useBookableLookup(bookableIds);
</script>
