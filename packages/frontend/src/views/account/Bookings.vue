<template>
  <Header :title="t('bookings')" has-back>
    <template #second>
      <AccountTabs />
    </template>
  </Header>
  <div class="mt-4">
    <div v-for="(bookings, date) in groupedBookings" :key="date" class="mt-2 mb-2">
      <p data-test="groupByDates" class="ml-2">
        <span class="font-bold">
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
          {{ dayjs(bookings[0].start).format('D') }} {{ dayjs(bookings[0].start).format('MMM') }}.</span
        >
        <span v-if="dayjs().isSame(bookings[0].start, 'day')" class="ml-2 text-sm"> {{ t('today') }}</span>
        <span v-if="dayjs().add(1, 'day').isSame(bookings[0].start, 'day')" class="ml-2 text-sm">{{
          t('tomorrow')
        }}</span>
      </p>
      <RouterLink
        v-for="booking in bookings"
        :key="booking._id"
        :to="{ name: 'account-booking', params: { bookingId: booking._id } }"
      >
        <BookingItem :booking="booking" />
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import { computed, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import Header from '~/components/headers/Header.vue';
import BookingItem from '~/components/list-items/BookingItem.vue';
import AccountTabs from '~/components/tabs/AccountTabs.vue';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Bookings',
  components: {
    AccountTabs,
    Header,
    BookingItem,
    RouterLink,
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const { data: bookings } = useFind(
      'bookings',
      ref({
        query: {
          bookedBy: user.value?._id,
        },
      }),
    );
    const groupedBookings = computed(() => {
      return groupBy(bookings.value, (booking: Model.Booking) => {
        const dayDate: string = dayjs(booking.start).format('DD/MM/YYYY');
        return dayDate;
      });
    });

    return { t, groupedBookings, dayjs };
  },
});
</script>
