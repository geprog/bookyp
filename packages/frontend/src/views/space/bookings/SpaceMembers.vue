<template>
  <SpaceBookingsHeader />

  <AppContent class="flex-col">
    <h2 class="m-3 font-bold">{{ t('members_with_bookings') }}</h2>
    <ProgressIndicator v-if="isLoadingMembers" />
    <ListItem
      v-for="member in spaceMembersWithTheirNewestBooking"
      v-else
      :key="member._id"
      :description="t('member_newest_booking') + formattedDate(member.newestBookingDate)"
      :label="
        t('member_name_and_email', {
          name: member.name,
          email: member._id === user?._id ? t('its_you') : member.email,
        })
      "
      class="cursor-pointer m-3 relative"
      :class="{ 'font-bold': member._id === user?._id }"
      @click="$router.push({ name: 'space-member-bookings', params: { spaceMemberId: member._id } })"
    />
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import SpaceBookingsHeader from '~/components/headers/SpaceBookingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const { currentSpace } = useCurrentSpace();

const { data: bookings } = useFind(
  'bookings',
  computed(() => ({
    query: {
      space: currentSpace.value?._id,
    },
  })),
);

const newestBookingOfMembers = computed(() =>
  bookings.value.reduce((acc, booking) => {
    const bookedBy = acc.get(booking.bookedBy);
    if (!bookedBy || bookedBy.start < booking.start) {
      acc.set(booking.bookedBy, booking);
    }
    return acc;
  }, new Map<string, Model.Booking>()),
);

function formattedDate(date: Date): string {
  return `${dayjs(date).format('DD.MM.YYYY')}`;
}

const spaceMembersWithABookingIDs = computed(() => Array.from(newestBookingOfMembers.value.keys()));

const { data: spaceMembersWithABooking, isLoading: isLoadingMembers } = useFind(
  'users',
  computed(() => ({
    query: {
      _id: {
        $in: spaceMembersWithABookingIDs.value,
      },
    },
  })),
);

const spaceMembersWithTheirNewestBooking = computed(() => {
  const membersWithNewestBooking = spaceMembersWithABooking.value.map((member) => {
    const newestBooking = newestBookingOfMembers.value.get(member._id);
    const newestBookingDate = newestBooking ? new Date(newestBooking.start) : new Date('DD.MM.YYYY');
    return {
      ...member,
      newestBookingDate,
    };
  });

  membersWithNewestBooking.sort((a, b) => b.newestBookingDate.getTime() - a.newestBookingDate.getTime());

  return membersWithNewestBooking;
});
</script>
