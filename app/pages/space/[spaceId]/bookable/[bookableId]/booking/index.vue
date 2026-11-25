<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton type="submit" form="booking" icon="check-mark" :disabled="isBookingOverlapping || submitting" :label="t('booking')" data-test="submit-booking" />
  </Teleport>

  <AppContent class="z-0">
    <form id="booking" class="mb-2 flex grow flex-col px-4" @submit.prevent="submit">
      <IconField icon="i-bookyp-document-one-page">
        <TextField v-model="description" :rows="5" :placeholder="t('description')" data-test="form-description" />
      </IconField>

      <DateRangePicker v-model:start="start" v-model:end="end" :bookings="bookings ?? []" :initial-date="combinedFilter.start" @booking:click="openBooking">
        <template v-if="isBookingOverlapping" #info-box>
          <InfoBox class="mr-2 flex flex-col bg-red-400 text-white">
            <p>{{ t('booking_overlaps', { bookable: bookable?.name }) }}</p>
          </InfoBox>
        </template>
      </DateRangePicker>
    </form>
  </AppContent>
</template>

<script setup lang="ts">
import type { Bookable, Booking, ForeignBooking } from '#shared/types/models';
import dayjs from 'dayjs';

/** Books a bookable: pick a time range (and confirm when the space is public). */
const { t } = useI18n();
const route = useRoute();
const { space, spaceId } = useCurrentSpace();
const { api, showError, translateError } = useApi();
const { openDialog } = useDialog();
const toast = useAppToast();

const bookableId = computed(() => route.params.bookableId as string);
const { data: bookable } = useApiData(() => `bookable:${bookableId.value}`, () => $fetch<Bookable>(`/api/bookables/${bookableId.value}`), { watch: [bookableId] });

useAppHeader(() => ({ menu: 'none', title: t('book_a_bookable', { bookable: bookable.value?.name ?? '' }), back: `/space/${spaceId.value}/bookables/map` }));

const { combinedFilter, resetBookablesFilter } = useBookables(spaceId);
const { data: bookings } = usePolling(
  () => `bookings:bookable:${bookableId.value}`,
  () => $fetch<(Booking | ForeignBooking)[]>('/api/bookings', { query: { bookable: bookableId.value, from: dayjs().startOf('day').toISOString() } }),
  { watch: [bookableId], default: () => [] },
);

const start = ref<Date>(combinedFilter.value.start);
const end = ref<Date>(combinedFilter.value.end);
const description = ref('');
const submitting = ref(false);

const isBookingOverlapping = computed(() =>
  (bookings.value ?? []).some(b => dayjs(b.start).isBefore(end.value) && dayjs(b.end).isAfter(start.value)),
);

// users may book in a space they can see, but the plan might not allow more bookings this month
const { canAddNewBookings } = useSubscriptionLimits(spaceId, { bookingMonth: start });
watch(canAddNewBookings, async (value) => {
  if (value) {
    return;
  }
  await openDialog({ title: t('subscription.upgrade_subscription'), description: t('subscription.used_all_bookings_member'), confirm: false });
  await navigateTo(`/space/${spaceId.value}/bookables/map`, { replace: true });
}, { immediate: true });

async function submit() {
  // bookings in public spaces are confirmed first, as the admin of the space gets to see the personal data
  const isPublicSpace = isFullSpace(space.value) ? space.value.isPublic === true : !space.value.role;
  if (isPublicSpace) {
    const confirmed = await openDialog({
      title: t('confirmation.confirm_a_bookable', { bookable: bookable.value?.name ?? '' }),
      description: `${t('confirmation.confirm_booking_in_public_space')} ${t('confirmation.confirm_personal_data_warning')}`,
    });
    if (!confirmed) {
      return;
    }
  }
  submitting.value = true;
  try {
    await api('/api/bookings', {
      method: 'POST',
      body: { bookable: bookableId.value, start: start.value.toISOString(), end: end.value.toISOString(), description: description.value },
    });
    resetBookablesFilter();
    await navigateTo('/account/bookings', { replace: true });
  }
  catch (error) {
    const code = getApiErrorCode(error);
    if (code === 'booking_overlaps') {
      toast.error(t('booking_overlaps', { bookable: bookable.value?.name ?? '' }));
    }
    else if (code) {
      toast.error(translateError(error));
    }
    else {
      showError(error);
    }
  }
  finally {
    submitting.value = false;
  }
}

async function openBooking(bookingId: string) {
  await navigateTo(`/account/booking/${bookingId}`);
}
</script>
