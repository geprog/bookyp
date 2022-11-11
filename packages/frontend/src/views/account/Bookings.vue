<template>
  <Header :title="t('bookings')" @click="$router.push({ name: 'spaces-list' })">
    <router-link
      :to="{ name: 'account-bookings' }"
      class="flex items-center"
      :class="{ 'text-primary-normal': $route.name === 'account-bookings' }"
      :aria-label="t('bookings')"
    >
      <Icon name="apps-list" />
    </router-link>
    <ExternalLink href="https://auth.geprog.com/auth/realms/bookyp/account">
      <Icon name="person" />
    </ExternalLink>
    <IconButton icon="sign-out" @click="logout" />
  </Header>
  <AppContent>
    <div class="mt-4">
      <div v-for="(bookings, date) in groupedBookings" :key="date">
        <p data-test="groupByDates" class="ml-2">
          <span class="font-bold">
            {{ dayjs(bookings[0].start).format('D') }} {{ dayjs(bookings[0].start).format('MMM.') }}</span
          >
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
          <BookingItem :booking="booking" class="m-3" />
        </router-link>
      </div>
    </div>
  </AppContent>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import ExternalLink from '~/components/buttons/ExternalLink.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import AppContent from '~/components/layout/AppContent.vue';
import BookingItem from '~/components/list-items/BookingItem.vue';
import { logout, user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Bookings',
  components: {
    Header,
    BookingItem,
    IconButton,
    ExternalLink,
    Icon,
    AppContent,
  },

  setup() {
    const { t } = useI18n();

    const bookingsQuery = computed(() => ({
      query: {
        bookedBy: user.value?._id,
        end: { $gte: dayjs().toISOString() },
      },
    }));
    const { data: bookings } = useFind('bookings', bookingsQuery);

    const sortedBookings = computed(() =>
      [...bookings.value].sort((a, b) => (dayjs(a.start).isBefore(b.start) ? -1 : 1)),
    );

    const groupedBookings = computed(() =>
      groupBy(sortedBookings.value, (booking: Model.Booking) => {
        const dayDate: string = dayjs(booking.start).format('DD/MM/YYYY');
        return dayDate;
      }),
    );

    return { t, groupedBookings, dayjs, logout };
  },
});
</script>
