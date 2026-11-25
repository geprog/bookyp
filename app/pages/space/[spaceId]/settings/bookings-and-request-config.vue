<template>
  <AppContent>
    <form id="bookingRequestConfigForm" class="w-full px-4">
      <RadioOption :selected="space.bookingsAndRequests === 'bookings'" :name="t('bookings')" :hint="t('booking_hint')" class="pb-4" data-test="mode-bookings" @select="update('bookings')" />
      <RadioOption :selected="space.bookingsAndRequests === 'requests'" :name="t('requests')" :hint="t('request_hint')" class="pb-4" data-test="mode-requests" @select="update('requests')" />
      <RadioOption :selected="space.bookingsAndRequests === 'both'" :name="t('booking_and_requests')" :hint="t('bookings_and_request_hint')" class="pb-4" data-test="mode-both" @select="update('both')" />
      <RadioOption :selected="space.bookingsAndRequests === 'only_info'" :name="t('only_space_info')" :hint="t('only_space_info_hint')" class="pb-4" data-test="mode-only-info" @select="update('only_info')" />
    </form>
  </AppContent>
</template>

<script setup lang="ts">
import type { BookingOrRequest } from '#shared/types/models';

const { t } = useI18n();
const { space, spaceId } = useCurrentSpace();
const { api, showError } = useApi();

useAppHeader(() => ({ menu: 'footer', title: t('booking_and_requests'), back: `/space/${spaceId.value}/settings` }));

async function update(bookingsAndRequests: BookingOrRequest) {
  try {
    await api(`/api/spaces/${spaceId.value}`, { method: 'PATCH', body: { bookingsAndRequests } });
  }
  catch (error) {
    showError(error);
  }
}
</script>
