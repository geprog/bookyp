<template>
  <router-view v-model:booking="booking" @submit="submit" />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { onMounted, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  bookableId: string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const feathers = useFeathers();
const { currentSpace } = useCurrentSpace();

const booking = ref<Partial<Model.Booking>>();

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  booking.value = { bookable: props.bookableId, bookedBy: user.value!._id, space: currentSpace.value?._id };
});

const bookableId = toRef(props, 'bookableId');
const { data: bookable } = useGet('bookables', bookableId);

async function submit() {
  if (!user.value) {
    throw new Error('Unexpected: User should be loaded');
  }

  if (!currentSpace.value?._id) {
    throw new Error('Unexpected: A space must be selected');
  }

  if (!booking.value) {
    throw new Error('Unexpected: A booking must be selected');
  }

  try {
    await feathers.service('bookings').create(booking.value);
    await router.replace({ name: 'account-bookings' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Booking overlaps with existing bookings') {
      toast.error(t('booking_overlaps', { bookable: bookable.value?.name }));
      return;
    }
    if (error instanceof Error && error.message === 'End date must be after start date') {
      toast.error(t('booking_invalid_end_date'));
      return;
    }
    throw error;
  }
}
</script>
