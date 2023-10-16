<template>
  <Header :title="t('request_details')" :back-fallback="{ name: 'space-pending-requests' }" />

  <AppContent class="flex-col">
    <div v-if="bookable" class="flex flex-col p-4 rounded-lg shadow-full bg-white m-4 gap-y-1">
      <div class="flex justify-between">
        <p :class="request?.request ? 'italic text-gray-400' : 'bold'">{{ bookable?.name }}</p>
        <p v-if="request?.request" class="italic text-gray-400">{{ t('requested') }}</p>
      </div>

      <p class="italic text-sm text-gray-500">{{ space?.name }}</p>
      <div v-if="request" class="grid grid-cols-[auto,1fr] grid-rows-2 text-gray-500 text-sm gap-1">
        <span> {{ t('start') }}:</span><span>{{ dayjs(request.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
        <span>{{ t('end') }}:</span><span>{{ dayjs(request?.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
        <span>{{ t('description') }}:</span>
        <pre>{{ request.description }}</pre>
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
        <MapObjects mode="highlight" :highlighted-bookable-id="bookableId" :space-id="space._id" />
      </SpaceMap>
    </div>
  </AppContent>
  <RequestDetailsActionButtons v-if="!isPastBooking" @reject="deleteRequest" @accept="acceptRequest" />
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import RequestDetailsActionButtons from '~/components/layout/toolbars/RequestDetailsActionButtons.vue';
import FloorPlan from '~/components/space/map/FloorPlan.vue';
import MapObjects from '~/components/space/map/MapObjects.vue';
import SpaceMap from '~/components/space/map/SpaceMap.vue';
import { useBack } from '~/compositions/useBack';
import { openDialog } from '~/compositions/useDialog';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  requestId: string;
}>();

const { t } = useI18n();
const feathers = useFeathers();
const { back } = useBack();

const requestId = toRef(props, 'requestId');
const { data: request } = useGet('bookings', requestId);
const { data: space } = useGet(
  'spaces',
  computed(() => request.value?.space),
);

const { data: bookedByUser } = useGet(
  'users',
  computed(() => request.value?.bookedBy),
);

const isPastBooking = computed(() => !request.value?.request || dayjs(request.value?.start).isBefore(new Date()));

const bookableId = computed(() => request.value?.bookable);
const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));

async function deleteRequest() {
  if (
    !(await openDialog({
      description: t('delete_dialog_description', { objectLabel: t('request') }),
      label: t('delete'),
      confirm: t('delete'),
    }))
  ) {
    return;
  }

  await feathers.service('bookings').remove(requestId.value, { query: { accept: false } });
  void back({ name: 'space-pending-requests' });
}

async function acceptRequest() {
  await feathers.service('bookings').patch(requestId.value, {}, { query: { accept: true } });
  void back({ name: 'space-pending-requests' });
}
</script>
