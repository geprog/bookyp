<template>
  <Header :title="t('booking_details')" has-back>
    <IconButton
      data-test="delete-button"
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      @click="modalVisible = true"
    />
  </Header>

  <div class="mt-4 mx-4">
    <h2 v-if="bookable" class="text-lg font-semibold">{{ bookable?.name }}</h2>
    <div v-if="booking" class="flex flex-col">
      <span>{{ t('start') }}: {{ dayjs(booking.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
      <span>{{ t('end') }}: {{ dayjs(booking?.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
    </div>
    <DeleteDialog data-test="delete-dialog" :visible="modalVisible" @confirmation="deleteBooking" />
  </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import DeleteDialog from '~/components/DeleteDialog.vue';
import Header from '~/components/headers/Header.vue';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'Booking',

  components: {
    Header,
    IconButton,
    DeleteDialog,
  },

  props: {
    bookingId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();

    const bookingId = toRef(props, 'bookingId');
    const { data: booking } = useGet('bookings', bookingId);

    const bookableId = computed(() => booking.value?.bookable);
    const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));
    const modalVisible = ref(false);

    async function deleteBooking(confirmation: boolean) {
      if (!confirmation) {
        modalVisible.value = false;
        return;
      }
      await feathers.service('bookings').remove(bookingId.value);
      router.back();
    }

    return { t, booking, bookable, dayjs, deleteBooking, modalVisible };
  },
});
</script>
