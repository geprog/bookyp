<template>
  <Header :title="t('bookings')" has-back />
  <div class="mt-4">
    <div v-for="(bookings, date) in groupedBookings" :key="date" class="w-full max-w-2xl mx-auto">
      <p data-test="groupByDates" class="ml-2">
        <span class="font-bold">
          {{ dayjs(bookings[0].start).format('D') }} {{ dayjs(bookings[0].start).format('MMM.') }}</span
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
        <BookingItem :booking="booking" class="m-3" />
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import Header from '~/components/headers/Header.vue';
import BookingItem from '~/components/list-items/BookingItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Bookings',
  components: {
    Header,
    BookingItem,
    RouterLink,
  },

  setup() {
    const { t } = useI18n();
    const { spaceId } = useCurrentSpace();

    const bookingsQuery = computed(() => ({
      query: {
        bookedBy: user.value?._id,
        space: spaceId.value,
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

    return { t, groupedBookings, dayjs };
  },
});
</script>
