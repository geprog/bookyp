<template>
  <nav class="z-10 fixed h-12 bg-gray-200 w-full mt-14 hidden md:flex justify-center gap-4 text-gray-900">
    <DesktopMenuItem
      :text="t('explore')"
      icon="magnifying-glass"
      :to="{ name: isMapSpaces ? 'spaces-map' : 'spaces-list' }"
    />
    <DesktopMenuItem
      :text="t('bookings')"
      icon="ticket"
      :spot="ongoingBookings.length > 0"
      :to="{ name: 'account-bookings' }"
    />
    <slot name="space-buttons" />
    <DesktopMenuItem
      :text="t('profile')"
      icon="person"
      :to="{ name: 'account' }"
      :class="{ 'router-link-exact-active ': highlightProfileButton }"
    />
  </nav>
  <div class="w-full md:h-14 flex-shrink-0" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

import DesktopMenuItem from './DesktopMenuItem.vue';

defineProps<{
  isMapSpaces?: boolean;
}>();

const { t } = useI18n();

const currentTime = ref(new Date());
setInterval(() => {
  currentTime.value = new Date();
}, 1000 * 60);

const bookingsQuery = computed(() => ({
  query: {
    bookedBy: user.value?._id,
    start: { $lte: dayjs(currentTime.value).toISOString() },
    end: { $gte: dayjs(currentTime.value).toISOString() },
  },
}));
const { data: rawBookings } = useFind('bookings', bookingsQuery);
const ongoingBookings = computed(() => [...rawBookings.value].filter((booking) => !booking.request));

const route = useRoute();
const path = computed(() => route.path);
const highlightProfileButton = computed<boolean>(
  () => path.value.includes('/account') && !path.value.includes('booking'),
);
</script>

<style scoped>
:deep(.router-link-exact-active) {
  @apply text-primary-normal;
}
</style>
