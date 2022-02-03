<template>
  <ListItem
    data-test="booking-item"
    :label="bookable ? bookable.name : t('no_bookable')"
    :description="`${dayjs(booking.start).format('HH:mm')} - ${bookingEnd}`"
  />
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed, defineComponent, PropType, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import ListItem from '~/components/list-items/ListItem.vue';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'BookingItem',

  components: { ListItem },

  props: {
    booking: {
      type: Object as PropType<Model.Booking>,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const booking = toRef(props, 'booking');
    const bookableId = computed(() => booking.value.bookable);
    const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));
    const bookingEnd = computed(() => {
      if (dayjs(booking.value.end).isAfter(dayjs(booking.value.start), 'days')) {
        return dayjs(booking.value.end).format('DD MMM HH:mm');
      }
      return dayjs(booking.value.end).format('HH:mm');
    });

    return { bookable, dayjs, t, bookingEnd };
  },
});
</script>
