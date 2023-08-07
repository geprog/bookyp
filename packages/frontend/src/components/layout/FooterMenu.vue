<template>
  <footer
    class="
      fixed
      bottom-0
      h-14
      bg-white
      border-t-1
      w-full
      flex
      gap-4
      justify-around
      text-gray-900
      shadow-top shadow-gray-400
      md:hidden
    "
  >
    <router-link
      :to="{ name: isMapSpaces ? 'spaces-map' : 'spaces-list' }"
      class="flex flex-col flex-grow items-center py-1.5 px-4"
    >
      <Icon name="magnifying-glass" />
      <span class="text-sm">{{ t('explore') }}</span>
    </router-link>
    <router-link :to="{ name: 'account-bookings' }" class="flex flex-col flex-grow items-center py-1.5 px-4">
      <div class="relative">
        <div
          v-if="ongoingBookings"
          class="absolute top-0 right-[-10px] bg-primary-dark h-3 w-3 rounded-full block flex-shrink-0"
        />
        <Icon name="ticket" />
      </div>
      <span class="text-sm">{{ t('bookings') }}</span>
    </router-link>
    <slot name="space-buttons" />
    <router-link :to="{ name: 'account' }" class="flex flex-col flex-grow items-center py-1.5 px-4">
      <Icon name="person" />
      <span class="text-sm">{{ t('profile') }}</span>
    </router-link>
  </footer>
  <div class="w-full h-14 flex-shrink-0" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Icon from '~/components/Icon.vue';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

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

const runningBookings = computed(() =>
  [...rawBookings.value].filter(
    (booking) => dayjs(booking.start).isBefore(currentTime.value) && dayjs(booking.end).isAfter(currentTime.value),
  ),
);
const ongoingBookings = computed(() => runningBookings.value.length > 0);
</script>

<style scoped>
:deep(.router-link-exact-active) {
  @apply text-primary-normal;
}
</style>
