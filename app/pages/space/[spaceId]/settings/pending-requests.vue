<template>
  <AppContent class="flex-col pt-2">
    <Spinner v-if="loading" />
    <div v-if="Object.keys(pendingRequests).length > 0">
      <div v-for="(group, date) in pendingRequests" :key="date">
        <p data-test="groupByDates" class="ml-4 font-bold">
          {{ dayjs(group[0]!.start).format('D MMM.') }}
        </p>
        <RequestItem v-for="request in group" :key="request._id" :booking="request" :bookable="bookableLookup.get(request.bookable)" class="m-3" @reject="rejectRequest(request)" @accept="acceptRequest(request)" />
      </div>
    </div>
    <div v-else-if="!loading" class="flex grow flex-col items-center justify-center">
      <img src="~/assets/img/no-new-request.svg" :alt="t('empty_requests_desc')" class="max-w-70 p-8">
      <p class="mb-8 text-center text-lg font-medium">
        {{ t('no_requests') }}
      </p>
    </div>
    <template v-if="Object.keys(pastRequests).length > 0">
      <h2 class="ml-2 py-2 text-lg font-bold">
        {{ t('past_requests') }}
      </h2>
      <div v-for="(group, date) in pastRequests" :key="date">
        <p data-test="groupByDates" class="ml-4 font-bold">
          {{ dayjs(group[0]!.start).format('D MMM.') }}
        </p>
        <RequestItem v-for="request in group" :key="request._id" :booking="request" :bookable="bookableLookup.get(request.bookable)" class="m-3" status-color="bg-gray-500" disabled />
      </div>
    </template>
  </AppContent>
</template>

<script setup lang="ts">
import type { Booking } from '#shared/types/models';
import dayjs from 'dayjs';

const { t } = useI18n();
const { spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { openDialog } = useDialog();

useAppHeader(() => ({ title: t('pending_requests'), back: `/space/${spaceId.value}/settings` }));

const { data: requests, loading } = usePolling(
  () => `requests:${spaceId.value}`,
  () => $fetch<Booking[]>('/api/bookings', { query: { space: spaceId.value, requests: 'true' } }),
  { watch: [spaceId], default: () => [] },
);

const bookableIds = computed(() => (requests.value ?? []).map(r => r.bookable));
const bookableLookup = useBookableLookup(bookableIds);

function groupByDay(list: Booking[]): Record<string, Booking[]> {
  const groups: Record<string, Booking[]> = {};
  for (const booking of list) {
    (groups[dayjs(booking.start).format('YYYY-MM-DD')] ??= []).push(booking);
  }
  return groups;
}

const sorted = computed(() => [...(requests.value ?? [])].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()));
const pendingRequests = computed(() => groupByDay(sorted.value.filter(b => b.request && dayjs(b.start).isAfter(new Date()))));
const pastRequests = computed(() => groupByDay(sorted.value.filter(b => !b.request || dayjs(b.start).isBefore(new Date()))));

async function rejectRequest(request: Booking) {
  if (!(await openDialog({ title: t('delete'), description: t('delete_dialog_description', { objectLabel: t('request') }), confirm: t('delete'), confirmColor: 'error' }))) {
    return;
  }
  try {
    await api(`/api/bookings/${request._id}`, { method: 'DELETE' });
  }
  catch (error) {
    showError(error);
  }
}

async function acceptRequest(request: Booking) {
  try {
    await api(`/api/bookings/${request._id}/accept`, { method: 'POST' });
  }
  catch (error) {
    showError(error);
  }
}
</script>
