<template>
  <Header :title="t('booking_and_requests')" :back-fallback="{ name: 'space-settings' }" />
  <AppContent>
    <form v-if="space" id="bookingRequestConfigForm" class="w-full px-4">
      <RadioButton
        :value="space.bookingsAndRequests === 'bookings'"
        :name="t('bookings')"
        :hint="t('booking_hint')"
        class="pb-4"
        @update-value="updateConfig('bookings')"
      />
      <RadioButton
        :value="space.bookingsAndRequests === 'requests'"
        :name="t('requests')"
        :hint="t('request_hint')"
        class="pb-4"
        @update-value="updateConfig('requests')"
      />
      <RadioButton
        :value="space.bookingsAndRequests === 'both'"
        :name="t('booking_and_requests')"
        :hint="t('bookings_and_request_hint')"
        class="pb-4"
        @update-value="updateConfig('both')"
      />
      <RadioButton
        :value="space.bookingsAndRequests === 'only_info'"
        :name="t('only_space_info')"
        :hint="t('only_space_info_hint')"
        class="pb-4"
        @update-value="updateConfig('only_info')"
      />
    </form>
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import RadioButton from '~/components/RadioButton.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

const { t } = useI18n();
const feathers = useFeathers();

const { currentSpace: space } = useCurrentSpace();

async function updateConfig(bookingsAndRequests: Model.BookingOrRequest) {
  if (space.value) {
    await feathers.service('spaces').update(space.value?._id, { ...space.value, bookingsAndRequests });
  }
}
</script>
