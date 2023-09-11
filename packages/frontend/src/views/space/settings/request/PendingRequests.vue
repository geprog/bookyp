<template>
  <Header :title="t('pending_requests')" :back-fallback="{ name: 'admin-area' }" />

  <AppContent class="flex-col pt-2">
    <ProgressIndicator v-if="isLoading" />
    <div v-for="(bookings, date) in upcomingBookings" :key="date">
      <p data-test="groupByDates" class="ml-4">
        <span class="font-bold">
          {{ dayjs(bookings[0].start).format('D') }} {{ dayjs(bookings[0].start).format('MMM.') }}</span
        >
      </p>
      <router-link
        v-for="booking in bookings"
        :key="booking._id"
        :to="{ name: 'account-booking', params: { bookingId: booking._id } }"
      >
        <RequestItem :booking="booking" class="m-3" />
      </router-link>
    </div>
    <template v-if="Object.values(pastBookings).length > 0">
      <h2 class="font-bold ml-2 py-2 text-lg">{{ t('past_requests') }}</h2>
      <div v-for="(bookings, date) in pastBookings" :key="date">
        <p data-test="groupByDates" class="ml-4">
          <span class="font-bold">
            {{ dayjs(bookings[0].start).format('D') }} {{ dayjs(bookings[0].start).format('MMM.') }}</span
          >
        </p>
        <router-link
          v-for="booking in bookings"
          :key="booking._id"
          :to="{ name: 'account-booking', params: { bookingId: booking._id } }"
        >
          <RequestItem :booking="booking" class="m-3" status-color="bg-gray-500" disabled />
        </router-link>
      </div>
    </template>
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import RequestItem from '~/components/list-items/RequestItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import useFind from '~/compositions/useFind';

const { t } = useI18n();

const bookingsParams = computed<Params | null>(() => ({
  query: {
    request: true,
  },
}));

const { data: rawBookings, isLoading } = useFind('bookings', bookingsParams);

const sortedBookings = computed(() =>
  [...rawBookings.value].sort((a, b) => (dayjs(a.start).isBefore(b.start) ? -1 : 1)),
);

const upcomingBookings = computed(() =>
  groupBy(
    sortedBookings.value.filter((b) => dayjs(b.start).isAfter(new Date()) && b.request),
    (booking: Model.Booking) => dayjs(booking.start).format('DD/MM/YYYY'),
  ),
);

const pastBookings = computed(() =>
  groupBy(
    sortedBookings.value.filter((b) => dayjs(b.start).isBefore(new Date()) || b.request === false),
    (booking: Model.Booking) => dayjs(booking.start).format('DD/MM/YYYY'),
  ),
);
</script>
