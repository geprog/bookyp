<template>
  <ListItem
    data-test="booking-item"
    :label="bookable ? bookable.name : t('no_bookable')"
    :description="`${dayjs(booking.start).format('HH:mm')} - ${dayjs(booking.end).format('HH:mm')}`"
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const booking = toRef(props, 'booking');
    const bookableId = computed(() => booking.value.bookable);
    const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));

    return { bookable, dayjs, t };
  },
});
</script>
