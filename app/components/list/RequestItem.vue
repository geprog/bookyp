<template>
  <ListItem data-test="request-item" :status-color="statusColor">
    <div class="ml-3 flex min-w-0 grow py-1">
      <NuxtLink :to="`/space/${booking.space}/settings/request-details/${booking._id}`" class="flex min-w-0 grow flex-col space-y-1">
        <!-- the same markup as v1: inline label and description around the block with the duration -->
        <div>
          <span data-test="label" class="truncate text-base" :class="disabled ? 'text-gray-500' : 'text-gray-900'">{{ booking.bookedByUser?.name || booking.bookedByUser?.email || t('no_bookable') }}</span>
          <div data-test="request-duration" class="flex flex-col pb-1 text-sm" :class="disabled ? 'text-gray-400' : 'text-gray-500'">
            {{ `${dayjs(booking.start).format('HH:mm')} - ${bookingEnd}` }}
          </div>
          <span data-test="description" class="w-full truncate text-sm" :class="disabled ? 'text-gray-400' : 'text-gray-500'">{{ bookable?.name ?? '' }}</span>
        </div>
      </NuxtLink>
      <div v-if="!disabled" class="flex">
        <IconButton icon="check-mark" :label="t('accept_request')" data-test="accept-request" @click="emit('accept')" />
        <IconButton icon="dismiss" :label="t('reject_request')" data-test="reject-request" @click="emit('reject')" />
      </div>
    </div>
  </ListItem>
</template>

<script setup lang="ts">
import type { Bookable, Booking } from '#shared/types/models';
import dayjs from 'dayjs';

const props = withDefaults(defineProps<{
  booking: Booking;
  bookable?: Bookable;
  statusColor?: string;
  disabled?: boolean;
}>(), {
  bookable: undefined,
  statusColor: 'bg-primary',
});

const emit = defineEmits<{ accept: []; reject: [] }>();

const { t } = useI18n();

const bookingEnd = computed(() =>
  dayjs(props.booking.end).isAfter(dayjs(props.booking.start), 'day')
    ? dayjs(props.booking.end).format('DD MMM HH:mm')
    : dayjs(props.booking.end).format('HH:mm'),
);
</script>
