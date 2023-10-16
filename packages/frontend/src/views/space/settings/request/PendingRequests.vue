<template>
  <SettingsHeader :title="t('pending_requests')" />

  <AppContent class="flex-col pt-2">
    <ProgressIndicator v-if="isLoading" />
    <div v-if="Object.values(pendingRequests).length > 0">
      <div v-for="(requests, date) in pendingRequests" :key="date">
        <p data-test="groupByDates" class="ml-4">
          <span class="font-bold">
            {{ dayjs(requests[0].start).format('D') }} {{ dayjs(requests[0].start).format('MMM.') }}
          </span>
        </p>
        <RequestItem
          v-for="request in requests"
          :key="request._id"
          :booking="request"
          class="m-3"
          @reject="rejectRequest(request)"
          @accept="acceptRequest(request)"
        />
      </div>
    </div>
    <div v-else class="flex flex-col justify-center items-center flex-grow">
      <img src="/src/assets/img/no-new-request.svg?url" :alt="t('empty_requests_desc')" class="max-w-70 p-8" />
      <p class="text-center font-medium text-lg mb-8">{{ t('no_requests') }}</p>
    </div>
    <template v-if="Object.values(pastRequests).length > 0">
      <h2 class="font-bold ml-2 py-2 text-lg">{{ t('past_requests') }}</h2>
      <div v-for="(requests, date) in pastRequests" :key="date">
        <p data-test="groupByDates" class="ml-4">
          <span class="font-bold">
            {{ dayjs(requests[0].start).format('D') }} {{ dayjs(requests[0].start).format('MMM.') }}
          </span>
        </p>
        <router-link
          v-for="request in requests"
          :key="request._id"
          :to="{ name: 'request-details', params: { requestId: request._id } }"
        >
          <RequestItem :booking="request" class="m-3" status-color="bg-gray-500" disabled />
        </router-link>
      </div>
    </template>
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';
import dayjs from 'dayjs';
import { groupBy } from 'lodash';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import RequestItem from '~/components/list-items/RequestItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { openDialog } from '~/compositions/useDialog';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const feathers = useFeathers();
const { currentSpace } = useCurrentSpace();

const requestsParams = computed<Params | null>(() => ({
  query: {
    request: { $nin: [undefined] },
    space: currentSpace.value?._id,
  },
}));

const { data: rawRequests, isLoading } = useFind('bookings', requestsParams);

const sortedRequests = computed(() =>
  [...rawRequests.value].sort((a, b) => (dayjs(a.start).isBefore(b.start) ? -1 : 1)),
);

const pendingRequests = computed(() =>
  groupBy(
    sortedRequests.value.filter((b) => dayjs(b.start).isAfter(new Date()) && b.request),
    (request: Model.Booking) => dayjs(request.start).format('DD/MM/YYYY'),
  ),
);

const pastRequests = computed(() =>
  groupBy(
    sortedRequests.value.filter((b) => !b.request || dayjs(b.start).isBefore(new Date())),
    (request: Model.Booking) => dayjs(request.start).format('DD/MM/YYYY'),
  ),
);

async function rejectRequest(request: Model.Booking) {
  if (
    !(await openDialog({
      description: t('delete_dialog_description', { objectLabel: t('request') }),
      label: t('delete'),
      confirm: t('delete'),
    }))
  ) {
    return;
  }

  await feathers.service('bookings').remove(request._id, { query: { accept: false } });
}

async function acceptRequest(request: Model.Booking) {
  await feathers.service('bookings').patch(request._id, {}, { query: { accept: true } });
}
</script>
