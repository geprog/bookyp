<template>
  <Header :title="t('bookings')" has-back>
    <IconButton
      icon="calendar"
      :icon-color="$route.name === 'space-bookings-calendar' ? 'text-primary-normal' : undefined"
      :aria-label="t('space_information')"
      data-test="btn-space-bookings-calendar"
      @click="$router.replace({ name: 'space-bookings-calendar' })"
    />
    <IconButton
      icon="apps-list"
      :icon-color="$route.name === 'space-bookings-members' ? 'text-primary-normal' : undefined"
      :aria-label="t('space_information')"
      data-test="btn-space-bookings-calendar"
      @click="$router.replace({ name: 'space-bookings-members' })"
    />
  </Header>

  <AppContent>
    <h2 class="m-3 font-bold">{{ t('members_with_bookings') }}</h2>

    <ListItem
      v-for="member in spaceMembersWithTheirNewestBooking"
      :key="member._id"
      :description="t('member_newest_booking', { date: member.newestBookingDate })"
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
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const { currentSpace } = useCurrentSpace();

const { data: bookings } = useFind(
  'bookings',
  computed(() => ({
    query: {
      spaceId: currentSpace.value?._id,
    },
  })),
);

const newestBookingOfMembers = computed(() =>
  bookings.value
    .filter((booking) => booking.space === currentSpace.value?._id)
    .reduce((acc, booking) => {
      if (!booking.bookedBy) {
        return acc;
      }
      return acc;
    }, new Map<string, Model.Booking>()),
);

const spaceMembersWithABookingIDs = computed(() => [
  ...Array.from(newestBookingOfMembers.value.keys()),
  ...(currentSpace.value?.members?.map((member) => member.userId) || []),
]);

const { data: spaceMembersWithABooking } = useFind(
  'users',
  computed(() => ({
    query: {
      _id: {
        $in: spaceMembersWithABookingIDs.value,
      },
    },
  })),
);

const spaceMembersWithTheirNewestBooking = computed(() =>
  spaceMembersWithABooking.value.map((member) => {
    const newestBooking = newestBookingOfMembers.value.get(member._id);
    const newestBookingDate = newestBooking ? dayjs(newestBooking.start).format('DD.MM.YYYY') : undefined;

    return {
      ...member,
      newestBookingDate,
    };
  }),
);
</script>
