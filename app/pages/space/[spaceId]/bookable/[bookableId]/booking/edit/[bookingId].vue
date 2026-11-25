<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton type="submit" form="booking" icon="check-mark" :disabled="isBookingOverlapping || !booking" :label="t('save')" data-test="submit-booking" />
  </Teleport>

  <AppContent v-if="booking" class="z-0">
    <form id="booking" class="mb-2 flex grow flex-col px-4" @submit.prevent="submit">
      <IconField icon="i-bookyp-document-one-page">
        <TextField v-model="description" :rows="5" :placeholder="t('description')" data-test="form-description" />
      </IconField>

      <DateRangePicker v-model:start="start" v-model:end="end" :bookings="otherBookings" :initial-date="start" @booking:click="openBooking">
        <template v-if="isBookingOverlapping" #info-box>
          <InfoBox class="mr-2 flex flex-col bg-red-400 text-white">
            <p>{{ t('booking_overlaps', { bookable: bookable?.name }) }}</p>
          </InfoBox>
        </template>
      </DateRangePicker>
    </form>
  </AppContent>
  <Spinner v-else />
</template>

<script setup lang="ts">
import type { Bookable, Booking, ForeignBooking } from '#shared/types/models';
import dayjs from 'dayjs';

const { t } = useI18n();
const route = useRoute();
const { api, showError } = useApi();
const { back } = useBack();

const bookableId = computed(() => route.params.bookableId as string);
const bookingId = computed(() => route.params.bookingId as string);

const { data: bookable } = useApiData(() => `bookable:${bookableId.value}`, () => $fetch<Bookable>(`/api/bookables/${bookableId.value}`), { watch: [bookableId] });
const { data: booking } = useApiData(() => `booking:${bookingId.value}`, () => $fetch<Booking>(`/api/bookings/${bookingId.value}`), { watch: [bookingId] });

useAppHeader(() => ({ menu: 'none', title: t('book_a_bookable', { bookable: bookable.value?.name ?? '' }), back: `/account/booking/${bookingId.value}` }));

const { data: bookings } = usePolling(
  () => `bookings:bookable:${bookableId.value}`,
  () => $fetch<(Booking | ForeignBooking)[]>('/api/bookings', { query: { bookable: bookableId.value, from: dayjs().startOf('day').toISOString() } }),
  { watch: [bookableId], default: () => [] },
);
const otherBookings = computed(() => (bookings.value ?? []).filter(b => b._id !== bookingId.value));

const start = ref<Date>(new Date());
const end = ref<Date>(new Date());
const description = ref('');

watch(booking, (value) => {
  if (value) {
    start.value = new Date(value.start);
    end.value = new Date(value.end);
    description.value = value.description ?? '';
  }
}, { immediate: true });

const isBookingOverlapping = computed(() =>
  otherBookings.value.some(b => dayjs(b.start).isBefore(end.value) && dayjs(b.end).isAfter(start.value)),
);

async function submit() {
  try {
    await api(`/api/bookings/${bookingId.value}`, {
      method: 'PUT',
      body: { start: start.value.toISOString(), end: end.value.toISOString(), description: description.value },
    });
    await back('/account/bookings');
  }
  catch (error) {
    showError(error);
  }
}

async function openBooking(id: string) {
  await navigateTo(`/account/booking/${id}`);
}
</script>
