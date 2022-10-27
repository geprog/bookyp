<template>
  <Header :title="t('booking_details')" has-back>
    <IconButton
      data-test="delete-button"
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      @click="modalVisible = true"
    />
  </Header>

  <AppContent>
    <div v-if="bookable" class="flex flex-col p-4 rounded-lg shadow-full bg-white m-4 gap-y-1">
      <h2 class="text-md">{{ bookable?.name }}</h2>
      <p class="italic text-sm text-gray-500">{{ space?.name }}</p>
      <div v-if="booking" class="grid grid-cols-[auto,1fr] grid-rows-2 text-gray-500 text-sm gap-1">
        <span> {{ t('start') }}:</span><span>{{ dayjs(booking.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
        <span>{{ t('end') }}:</span><span>{{ dayjs(booking?.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
      </div>
    </div>
    <div class="flex flex-col p-4 rounded-lg shadow-full bg-white m-4 gap-y-1">
      <SpaceMap>
        <FloorPlan />
        <MapObjects consider-filter :highlighted-bookable-id="bookableId" />
      </SpaceMap>
    </div>
    <DeleteDialog
      data-test="delete-dialog"
      :object-label="t('booking')"
      :visible="modalVisible"
      @confirmation="deleteBooking"
    />
  </AppContent>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import { computed, defineComponent, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import DeleteDialog from '~/components/DeleteDialog.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'Booking',

  components: {
    Header,
    IconButton,
    DeleteDialog,
    AppContent,
    FloorPlan,
    MapObjects,
    SpaceMap,
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
    const { data: space } = useGet(
      'spaces',
      computed(() => booking.value?.space),
    );

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

    return { t, booking, bookable, bookableId, space, dayjs, deleteBooking, modalVisible };
  },
});
</script>
