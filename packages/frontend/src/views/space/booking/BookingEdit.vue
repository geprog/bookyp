<template>
  <Header :title="t('book_a_bookable', { bookable: bookable?.name })" :back-fallback="{ name: 'bookables-map' }">
    <template #right>
      <IconButton type="submit" form="booking" icon="check-mark" :disabled="isBookingOverlapping" />
    </template>
  </Header>

  <AppContent v-if="bookingDetails" class="z-0">
    <form id="booking" class="booking px-4 flex flex-col mb-2 flex-grow" @submit.prevent="submit">
      <LabelField icon-name="document-one-page">
        <TextField v-model="bookingDetails.description" :rows="5" :placeholder="t('description')" />
      </LabelField>

      <DateRangePicker
        v-model:start="bookingDetails.start"
        v-model:end="bookingDetails.end"
        :bookings="bookings"
        :initial-date="combinedFilter.start"
        @booking:click="openBooking"
      >
        <template v-if="isBookingOverlapping" #info-box>
          <InfoBox class="mr-2 flex flex-col" :class="{ 'bg-red-400 text-white': isBookingOverlapping }">
            <p>{{ t('booking_overlaps') }}</p>
          </InfoBox>
        </template>
      </DateRangePicker>
    </form>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InfoBox from '~/components/InfoBox.vue';
import DateRangePicker from '~/components/inputs/DateRangePicker.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import TextField from '~/components/TextField.vue';
import { useBack } from '~/compositions/useBack';
import { useBookables } from '~/compositions/useBookables';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  booking?: Partial<Model.Booking>;
  bookingId: string;
}>();

const { t } = useI18n();
const router = useRouter();

const booking = toRef(props, 'booking');
const bookingId = toRef(props, 'bookingId');
const { data: bookingDetails } = useGet('bookings', bookingId);
const bookableId = computed(() => booking.value?.bookable);
const { data: bookables } = useFind(
  'bookables',
  computed(() => ({})),
);
const { bookablesWithFilterMatched, combinedFilter } = useBookables(bookables);
const bookable = computed(() =>
  bookablesWithFilterMatched.value.find(
    (bookableWithFilterMatched) => bookableWithFilterMatched._id === bookableId.value,
  ),
);

const { data: bookings } = useFind(
  'bookings',
  computed(() => {
    if (!bookableId.value) {
      return undefined;
    }
    return {
      query: {
        _id: { $ne: bookingId.value },
        bookable: bookableId.value,
      },
    };
  }),
);

const isBookingOverlapping = computed(() =>
  bookings.value.some(
    (b) =>
      bookingDetails.value &&
      dayjs(b.start).isBefore(bookingDetails.value.end) &&
      dayjs(b.end).isAfter(bookingDetails.value.start),
  ),
);

const { back } = useBack();

const feathers = useFeathers();

const submit = async () => {
  await feathers.service('bookings').update(bookingId.value, { ...bookingDetails.value });
  void back({ name: 'account-bookings' });
};

async function openBooking(_bookingId: Model.Ref<Model.Booking>) {
  await router.push({ name: 'account-booking', params: { bookingId: _bookingId } });
}
</script>
