<template>
  <Header :title="t('booking_details')" has-back />
  <div class="mt-4 mx-4">
    <h2 v-if="bookable" class="text-lg font-semibold">{{ bookable?.name }}</h2>
    <div v-if="booking" class="flex flex-col">
      <span>{{ t('start') }}: {{ dayjs(booking.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
      <span>{{ t('end') }}: {{ dayjs(booking?.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'Booking',
  components: {
    Header,
  },

  props: {
    // used by toRef
    // eslint-disable-next-line vue/no-unused-properties
    bookingId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();

    const bookingId = toRef(props, 'bookingId');
    const { data: booking } = useGet('bookings', bookingId);

    const bookableId = computed(() => booking.value?.bookable);
    const { data: bookable } = useGet('bookables', bookableId);

    return { t, booking, bookable, dayjs };
  },
});
</script>
