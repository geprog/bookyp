<template>
  <SpaceBookingsHeaderActions active="members" />
  <AppContent class="flex-col">
    <h2 class="m-3 font-bold">
      {{ t('members_with_bookings') }}
    </h2>
    <Spinner v-if="loading" />
    <ListItem
      v-for="member in membersWithNewestBooking"
      :key="member._id"
      :description="t('member_newest_booking', { date: member.newestBookingDate })"
      :label="t('member_name_and_email', { name: member.name, email: member._id === user?._id ? t('its_you') : member.email })"
      class="relative m-3"
      :class="{ 'font-bold': member._id === user?._id }"
      data-test="member-bookings-item"
      :to="`/space/${spaceId}/bookings/member/${member._id}/booking`"
    />
  </AppContent>
</template>

<script setup lang="ts">
import type { Booking, PublicUser } from '#shared/types/models';
import dayjs from 'dayjs';

const { t } = useI18n();
const { user } = useAuth();
const { spaceId } = useCurrentSpace();

useAppHeader(() => ({ menu: 'footer', title: t('bookings'), back: `/space/${spaceId.value}/bookables/map` }));

const { data: bookings, loading } = usePolling(
  () => `bookings:${spaceId.value}:all`,
  () => $fetch<Booking[]>('/api/bookings', { query: { space: spaceId.value } }),
  { watch: [spaceId], default: () => [] },
);

const membersWithNewestBooking = computed(() => {
  const newest = new Map<string, { user: PublicUser; start: string }>();
  for (const booking of bookings.value ?? []) {
    if (!booking.bookedByUser) {
      continue;
    }
    const existing = newest.get(booking.bookedBy);
    if (!existing || existing.start < booking.start) {
      newest.set(booking.bookedBy, { user: booking.bookedByUser, start: booking.start });
    }
  }
  return [...newest.values()]
    .sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf())
    .map(({ user: member, start }) => ({ ...member, newestBookingDate: dayjs(start).format('DD.MM.YYYY') }));
});
</script>
