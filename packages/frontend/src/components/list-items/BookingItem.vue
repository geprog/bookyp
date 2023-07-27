<template>
  <ListItem data-test="booking-item" :status-color="statusColor">
    <div class="flex ml-3 flex-grow min-w-0 py-1">
      <div class="flex flex-col min-w-0 flex-grow space-y-1">
        <span data-test="label" class="text-base truncate text-gray-900">{{
          bookable ? bookable.name : t('no_bookable')
        }}</span>
        <span data-test="description" class="w-full text-sm truncate text-gray-500 italic">{{ space?.name }}</span>
      </div>
      <div data-test="booking-duration" class="flex ml-3 text-gray-500 text-sm flex-col">
        {{ `${dayjs(booking.start).format('HH:mm')} - ${bookingEnd}` }}
        <span v-if="booking?.request" class="italic text-gray-500 mt-2 flex mr-1 justify-end">{{
          t('requested')
        }}</span>
      </div>
    </div>
  </ListItem>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import ListItem from '~/components/list-items/ListItem.vue';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  booking: Model.Booking;
  statusColor?: string;
}>();

const { t } = useI18n();
const booking = toRef(props, 'booking');
const { data: space } = useGet(
  'spaces',
  computed(() => booking.value.space),
);
const bookableId = computed(() => booking.value.bookable);
const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));
const bookingEnd = computed(() => {
  if (dayjs(booking.value.end).isAfter(dayjs(booking.value.start), 'days')) {
    return dayjs(booking.value.end).format('DD MMM HH:mm');
  }
  return dayjs(booking.value.end).format('HH:mm');
});
</script>
