<template>
  <ProgressIndicator v-if="!bookedBy" />
  <ListItem v-else data-test="request-item" :status-color="statusColor">
    <div class="flex ml-3 flex-grow min-w-0 py-1">
      <div class="flex flex-col min-w-0 flex-grow space-y-1">
        <span data-test="label" class="text-base truncate text-gray-900" :class="[{ '!text-gray-500': disabled }]">{{
          bookedBy ? bookedBy.name : t('no_bookable')
        }}</span>
        <div
          data-test="request-duration"
          class="flex text-gray-500 text-sm flex-col pb-1"
          :class="[{ '!text-gray-400': disabled }]"
        >
          {{ `${dayjs(booking.start).format('HH:mm')} - ${bookingEnd}` }}
        </div>
        <span
          data-test="description"
          class="w-full text-sm truncate text-gray-500"
          :class="[{ '!text-gray-400': disabled }]"
        >
          {{ bookable ? bookable.name : space?.name }}
        </span>
      </div>
      <div v-if="!disabled" class="flex">
        <IconButton icon="check-mark" @click="emits('accept')" />
        <IconButton icon="dismiss" @click="emits('reject')" />
      </div>
    </div>
  </ListItem>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  booking: Model.Booking;
  statusColor?: string;
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (event: 'accept'): void;
  (event: 'reject'): void;
}>();

const { t } = useI18n();
const booking = toRef(props, 'booking');
const { data: space } = useGet(
  'spaces',
  computed(() => booking.value.space),
);
const bookableId = computed(() => booking.value.bookable);
const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));
const { data: bookedBy } = useGet(
  'users',
  computed(() => booking.value.bookedBy),
);
const bookingEnd = computed(() => {
  if (dayjs(booking.value.end).isAfter(dayjs(booking.value.start), 'days')) {
    return dayjs(booking.value.end).format('DD MMM HH:mm');
  }
  return dayjs(booking.value.end).format('HH:mm');
});
</script>
