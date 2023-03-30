<template>
  <Header :title="t('booking_details')" :back-fallback="{ name: 'account-bookings' }">
    <IconButton
      v-if="booking?.bookedBy === user?._id"
      data-test="delete-button"
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      @click="deleteBooking"
    />
  </Header>

  <AppContent>
    <div v-if="bookable" class="flex flex-col p-4 rounded-lg shadow-full bg-white m-4 gap-y-1">
      <h2 class="text-md">{{ bookable?.name }}</h2>
      <p class="italic text-sm text-gray-500">{{ space?.name }}</p>
      <div v-if="booking" class="grid grid-cols-[auto,1fr] grid-rows-2 text-gray-500 text-sm gap-1">
        <span> {{ t('start') }}:</span><span>{{ dayjs(booking.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
        <span>{{ t('end') }}:</span><span>{{ dayjs(booking?.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
        <span>{{ t('description') }}:</span>
        <pre>{{ booking.description }}</pre>
      </div>
      <div v-if="bookedByUser" class="mt-2 grid grid-cols-[auto,1fr] grid-rows-2 text-sm gap-1">
        <template v-if="bookedByUser.name">
          <span>{{ t('name') }}:</span><span>{{ bookedByUser.name }}</span>
        </template>
        <span>{{ t('email') }}:</span>
        <a class="text-blue-600 underline-current underline" :href="`mailto:${bookedByUser.email}`">
          {{ bookedByUser.email }}
        </a>
      </div>
    </div>
    <div class="flex flex-col p-4 rounded-lg shadow-full bg-white m-4 gap-y-1 max-h-100">
      <SpaceMap v-if="space">
        <FloorPlan :space-id="space._id" />
        <MapObjects :highlighted-bookable-id="bookableId" :space-id="space._id" />
      </SpaceMap>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { openDialog } from 'vue3-promise-dialog';

import IconButton from '~/components/buttons/IconButton.vue';
import Dialog from '~/components/Dialog.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import { user } from '~/compositions/useAuthentication';
import { useBack } from '~/compositions/useBack';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  bookingId: string;
}>();

const { t } = useI18n();
const feathers = useFeathers();
const { back } = useBack();

const bookingId = toRef(props, 'bookingId');
const { data: booking } = useGet('bookings', bookingId);
const { data: space } = useGet(
  'spaces',
  computed(() => booking.value?.space),
);

const { data: bookedByUser } = useGet(
  'users',
  computed(() => booking.value?.bookedBy),
);

const bookableId = computed(() => booking.value?.bookable);
const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));

async function deleteBooking() {
  if (
    !(await openDialog(Dialog, {
      description: t('delete_dialog_description', { objectLabel: t('booking') }),
      label: t('delete'),
      confirm: t('delete'),
    }))
  ) {
    return;
  }

  await feathers.service('bookings').remove(bookingId.value);
  void back({ name: 'account-bookings' });
}
</script>
