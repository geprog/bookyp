<template>
  <Header :title="t('book_a_bookable', { bookable: bookable?.name })" :back-fallback="{ name: 'bookables-map' }">
    <IconButton type="submit" form="booking" icon="check-mark" :disabled="isBookingOverlapping" />
  </Header>

  <AppContent>
    <form id="booking" class="booking px-4 flex flex-col mb-2 flex-grow" @submit.prevent="submit">
      <LabelField icon-name="document-one-page">
        <TextField v-model="description" :rows="5" :placeholder="t('description')" />
      </LabelField>

      <DateRangePicker
        v-model:start="start"
        v-model:end="end"
        :bookings="bookings"
        :initial-date="combinedFilter.start"
        @booking:click="openBooking"
      >
        <template #info-box>
          <InfoBox class="mr-2 flex flex-col" :class="{ 'bg-red-400 text-white': isBookingOverlapping }">
            <p v-if="isBookingOverlapping">{{ t('booking_overlaps') }}</p>
          </InfoBox>
        </template>
      </DateRangePicker>
    </form>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import InfoBox from '~/components/InfoBox.vue';
import DateRangePicker from '~/components/inputs/DateRangePicker.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBookables } from '~/compositions/useBookables';
import useFind from '~/compositions/useFind';

const props = defineProps<{
  booking?: Partial<Model.Booking>;
}>();

const emit = defineEmits<{
  (event: 'update:booking', booking: Partial<Model.Booking>): void;
  (event: 'submit'): void;
}>();

const { t } = useI18n();
const router = useRouter();

const booking = toRef(props, 'booking');
const bookableId = computed(() => booking.value?.bookable);
const { data: bookables } = useFind(
  'bookables',
  computed(() => ({})),
);
const { bookablesWithFilterMatched, combinedFilter, resetBookablesFilter } = useBookables(bookables);
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
        bookable: bookableId.value,
      },
    };
  }),
);

const start = ref(combinedFilter.value?.start || new Date());
const end = ref(combinedFilter.value?.end || dayjs().add(1, 'hour').toDate());

const description = ref('');

const isBookingOverlapping = computed(() =>
  bookings.value.some((b) => dayjs(b.start).isBefore(end.value) && dayjs(b.end).isAfter(start.value)),
);

const { currentSpace } = useCurrentSpace();

const submit = async () => {
  emit('update:booking', { ...booking.value, start: start.value, end: end.value, description: description.value });
  resetBookablesFilter();
  if (currentSpace.value?.plan === 'public') {
    await router.push({ name: 'booking-confirm' });
  } else {
    emit('submit');
  }
};

async function openBooking(bookingId: Model.Ref<Model.Booking>) {
  await router.push({ name: 'account-booking', params: { bookingId } });
}
</script>
