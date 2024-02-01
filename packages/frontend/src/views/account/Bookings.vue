<template>
  <Header
    :title="t('own_bookings')"
    :back-fallback="{ name: 'space', params: { spaceId: savedSpaceId } }"
    right-class="hidden md:flex"
  />
  <DesktopMenu />
  <AppContent class="flex-col">
    <ProgressIndicator v-if="isLoading" />
    <template v-else>
      <div v-if="noBookings" class="flex flex-col items-center justify-center gap-2 pt-8 pl-8 pr-8">
        <img src="/src/assets/img/no-bookings.svg?url" class="pb-8" />
        <p class="text-lg font-semibold text-gray-900">
          {{ t('no_bookings') }}
        </p>
        <i18n-t
          v-if="!savedSpaceId"
          keypath="route_to_space.text_without_space"
          tag="p"
          class="text-base text-center font-normal"
        >
          <router-link :to="{ name: 'home' }" class="underline">{{ t('route_to_space.list_of_spaces') }}</router-link>
        </i18n-t>
        <p v-else class="text-center text-base font-normal">
          {{ t('route_to_space.text_with_space_1') }}
          <router-link :to="{ name: 'space', params: { spaceId: savedSpaceId } }" class="underline">{{
            t('route_to_space.click_map_object')
          }}</router-link>
          <br />
          {{ t('route_to_space.text_with_space_2') }}
        </p>
      </div>
      <div class="mt-4">
        <div v-for="(bookings, date) in upcomingBookings" :key="date">
          <p data-test="groupByDates" class="ml-2">
            <span class="font-bold"> {{ dayjs(bookings[0].start).format('D MMM.') }}</span>
            <span v-if="dayjs().isSame(bookings[0].start, 'day')" class="ml-2 text-sm"> {{ t('today') }}</span>
            <span v-if="dayjs().add(1, 'day').isSame(bookings[0].start, 'day')" class="ml-2 text-sm">{{
              t('tomorrow')
            }}</span>
          </p>
          <router-link
            v-for="booking in bookings"
            :key="booking._id"
            :to="{ name: 'account-booking', params: { bookingId: booking._id } }"
          >
            <BookingItem :booking="booking" class="m-3" :status-color="booking?.request ? 'bg-gray-200' : undefined" />
          </router-link>
        </div>
        <template v-if="Object.values(pastBookings).length > 0">
          <div class="flex flex-row justify-between items-center mt-8">
            <span class="font-bold text-lg">{{ t('past_bookings') }}</span>
            <Icon
              name="dropdown"
              class="cursor-pointer"
              :class="{ 'transform rotate-180': isDisplay }"
              @click="togglePastBookings"
            />
          </div>
          <div v-if="isDisplay">
            <div v-for="(bookings, date) in pastBookings" :key="date">
              <p data-test="groupByDates" class="ml-2 font-bold">
                {{ dayjs(bookings[0].start).format('D MMM. YYYY') }}
              </p>
              <router-link
                v-for="booking in bookings"
                :key="booking._id"
                :to="{ name: 'account-booking', params: { bookingId: booking._id } }"
              >
                <BookingItem :booking="booking" status-color="bg-gray-inactive" class="m-3" />
              </router-link>
            </div>
          </div>
        </template>
      </div>
    </template>
  </AppContent>
  <FooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import AppContent from '~/components/layout/AppContent.vue';
import DesktopMenu from '~/components/layout/DesktopMenu.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import BookingItem from '~/components/list-items/BookingItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { savedSpaceId } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

const { t } = useI18n();

const bookingsQuery = computed(() => ({
  query: {
    bookedBy: user.value?._id,
  },
}));

const { data: rawBookings, isLoading } = useFind('bookings', bookingsQuery);

const isDisplay = ref<boolean>();
function togglePastBookings() {
  isDisplay.value = !isDisplay.value;
}

const upcomingBookings = computed(() =>
  groupBy(
    [...rawBookings.value]
      .filter((b) => dayjs(b.end).isAfter(new Date()))
      .sort((a, b) => (dayjs(a.start).isBefore(b.start) ? -1 : 1)),
    (booking: Model.Booking) => dayjs(booking.start).format('DD/MM/YYYY'),
  ),
);

const pastBookings = computed(() =>
  groupBy(
    [...rawBookings.value]
      .filter((b) => dayjs(b.end).isBefore(new Date()))
      .sort((a, b) => (dayjs(a.start).isAfter(b.start) ? -1 : 1)),
    (booking: Model.Booking) => dayjs(booking.start).format('DD/MM/YYYY'),
  ),
);

const noBookings = computed(() => Object.values(upcomingBookings.value).length === 0);
</script>
