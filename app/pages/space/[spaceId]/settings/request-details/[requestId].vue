<template>
  <AppContent class="flex-col">
    <Spinner v-if="!error && (!request || !bookable)" />
    <template v-else-if="request && bookable">
      <div class="m-4 flex flex-col gap-y-1 rounded-lg bg-white p-4 shadow-full">
        <div class="flex justify-between">
          <p :class="request.request ? 'text-gray-400 italic' : ''">
            {{ bookable.name }}
          </p>
          <p v-if="request.request" class="text-gray-400 italic">
            {{ t('requested') }}
          </p>
        </div>
        <div v-if="request.deleted" class="my-2 flex flex-row items-center justify-center">
          <InfoBox class="mr-2 flex flex-col bg-red-400 text-white">
            <p>{{ t('deleted_request') }}</p>
          </InfoBox>
        </div>
        <p class="text-sm text-gray-500 italic">
          {{ space.name }}
        </p>
        <div class="grid grid-cols-[auto_1fr] gap-1 text-sm text-gray-500">
          <span>{{ t('start') }}:</span><span>{{ dayjs(request.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
          <span>{{ t('end') }}:</span><span>{{ dayjs(request.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
          <span>{{ t('description') }}:</span>
          <pre>{{ request.description }}</pre>
        </div>
        <div v-if="request.bookedByUser" class="mt-2 grid grid-cols-[auto_1fr] gap-1 text-sm">
          <template v-if="request.bookedByUser.name">
            <span>{{ t('name') }}:</span><span>{{ request.bookedByUser.name }}</span>
          </template>
          <span>{{ t('email') }}:</span>
          <a class="text-blue-600 underline" :href="`mailto:${request.bookedByUser.email}`">{{ request.bookedByUser.email }}</a>
        </div>
      </div>
      <div class="m-4 flex max-h-100 flex-col gap-y-1 rounded-lg bg-white p-4 shadow-full">
        <SpaceMap>
          <FloorPlan :floor-plan="space.floorPlan" />
          <MapObjects mode="highlight" :highlighted-bookable-id="request.bookable" :space-id="space._id" />
        </SpaceMap>
      </div>
    </template>
  </AppContent>
  <div v-if="request && !isPastRequest" class="flex w-full justify-center">
    <div class="fixed bottom-18 mb-1 flex w-full max-w-5xl justify-between px-4 md:bottom-5">
      <FloatingButton icon="i-bookyp-dismiss" :text="t('reject_request')" foreground-color="red" background-color="white" data-test="reject-request" @click="reject" />
      <FloatingButton icon="i-bookyp-check-mark" :text="t('accept_request')" data-test="accept-request" @click="accept" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bookable, Booking } from '#shared/types/models';
import dayjs from 'dayjs';

const { t } = useI18n();
const route = useRoute();
const { space, spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { openDialog } = useDialog();
const { back } = useBack();

useAppHeader(() => ({ menu: 'footer', title: t('request_details'), back: `/space/${spaceId.value}/settings/pending-requests` }));

const requestId = computed(() => route.params.requestId as string);
const { data: request, error } = usePolling(() => `booking:${requestId.value}`, () => $fetch<Booking>(`/api/bookings/${requestId.value}`), { watch: [requestId] });
const { data: bookable } = useApiData(
  () => `bookable:${request.value?.bookable}`,
  async () => (request.value ? await $fetch<Bookable>(`/api/bookables/${request.value.bookable}`) : null),
  { watch: [() => request.value?.bookable] },
);

// accepted, rejected (deleted) and started requests cannot be decided anymore
const isPastRequest = computed(() => !request.value?.request || !!request.value.deleted || dayjs(request.value.start).isBefore(new Date()));

async function reject() {
  if (!(await openDialog({ title: t('delete'), description: t('delete_dialog_description', { objectLabel: t('request') }), confirm: t('delete'), confirmColor: 'error' }))) {
    return;
  }
  try {
    await api(`/api/bookings/${requestId.value}`, { method: 'DELETE' });
    await back(`/space/${spaceId.value}/settings/pending-requests`);
  }
  catch (error) {
    showError(error);
  }
}

async function accept() {
  try {
    await api(`/api/bookings/${requestId.value}/accept`, { method: 'POST' });
    await back(`/space/${spaceId.value}/settings/pending-requests`);
  }
  catch (error) {
    showError(error);
  }
}
</script>
