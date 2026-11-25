<template>
  <ListItem data-test="booking-item" :status-color="statusColor" :to="to">
    <Spinner v-if="!bookable" />
    <div v-else class="ml-3 flex min-w-0 grow py-1">
      <div class="flex min-w-0 grow flex-col space-y-1">
        <span data-test="label" class="truncate text-base text-gray-900">{{ bookable.name }}</span>
        <span data-test="description" class="w-full truncate text-sm text-gray-500 italic">{{ space?.name }}</span>
      </div>
      <div data-test="booking-duration" class="ml-3 flex flex-col text-sm text-gray-500">
        {{ `${dayjs(booking.start).format('HH:mm')} - ${bookingEnd}` }}
        <span v-if="booking.request" class="mt-2 mr-1 flex justify-end text-gray-500 italic">{{ t('requested') }}</span>
      </div>
    </div>
  </ListItem>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import type { Bookable, Booking } from '#shared/types/models';
import type { AnySpace } from '~/composables/useSpaces';
import dayjs from 'dayjs';

const props = withDefaults(defineProps<{
  booking: Booking;
  statusColor?: string;
  to?: RouteLocationRaw;
  /** already loaded lookups, so lists do not fetch per item */
  bookables?: Map<string, Bookable>;
  spaces?: Map<string, AnySpace>;
}>(), {
  statusColor: 'bg-primary',
  to: undefined,
  bookables: undefined,
  spaces: undefined,
});

const { t } = useI18n();

const bookable = computed(() => props.bookables?.get(props.booking.bookable));
const space = computed(() => props.spaces?.get(props.booking.space));

const bookingEnd = computed(() =>
  dayjs(props.booking.end).isAfter(dayjs(props.booking.start), 'day')
    ? dayjs(props.booking.end).format('DD MMM HH:mm')
    : dayjs(props.booking.end).format('HH:mm'),
);
</script>
