<template>
  <Header :title="t('booking_details')" has-back>
    <IconButton
      v-if="booking?.bookedBy === user?._id"
      data-test="delete-button"
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      @click="modalVisible = true"
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
    <Dialog
      data-test="delete-dialog"
      :description="t('delete_dialog_description', { objectLabel: t('booking') })"
      :label="t('delete')"
      :confirm="t('delete')"
      :visible="modalVisible"
      @confirmation="deleteBooking"
    />
  </AppContent>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Dialog from '~/components/Dialog.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  bookingId: string;
}>();

const { t } = useI18n();
const feathers = useFeathers();
const router = useRouter();

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
const modalVisible = ref(false);

async function deleteBooking(confirmation: boolean) {
  if (!confirmation) {
    modalVisible.value = false;
    return;
  }
  await feathers.service('bookings').remove(bookingId.value);
  router.back();
}
</script>
