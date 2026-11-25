<template>
  <AppContent class="flex-col">
    <Spinner v-if="loading" />
    <template v-else>
      <div v-if="noBookings" class="flex flex-col items-center justify-center gap-2 px-8 pt-8">
        <img src="~/assets/img/no-bookings.svg" class="pb-8" alt="">
        <p class="text-lg font-semibold text-gray-900">
          {{ t('no_bookings') }}
        </p>
        <i18n-t v-if="!savedSpaceId" keypath="route_to_space.text_without_space" tag="p" class="text-center text-base font-normal">
          <NuxtLink to="/" class="underline">
            {{ t('route_to_space.list_of_spaces') }}
          </NuxtLink>
        </i18n-t>
        <p v-else class="text-center text-base font-normal">
          {{ t('route_to_space.text_with_space_1') }}
          <NuxtLink :to="`/space/${savedSpaceId}`" class="underline">
            {{ t('route_to_space.click_map_object') }}
          </NuxtLink>
          <br>
          {{ t('route_to_space.text_with_space_2') }}
        </p>
      </div>
      <div class="mt-4">
        <div v-for="(group, date) in upcomingBookings" :key="date">
          <p data-test="groupByDates" class="ml-2">
            <span class="font-bold"> {{ dayjs(group[0]!.start).format('D MMM.') }}</span>
            <span v-if="dayjs().isSame(group[0]!.start, 'day')" class="ml-2 text-sm"> {{ t('today') }}</span>
            <span v-if="dayjs().add(1, 'day').isSame(group[0]!.start, 'day')" class="ml-2 text-sm">{{ t('tomorrow') }}</span>
          </p>
          <BookingItem
            v-for="booking in group"
            :key="booking._id"
            :booking="booking"
            :bookables="bookableLookup"
            :spaces="spaceLookup"
            :to="`/account/booking/${booking._id}`"
            class="m-3"
            :status-color="booking.request ? 'bg-gray-200' : undefined"
          />
        </div>
        <template v-if="Object.keys(pastBookings).length > 0">
          <div class="mt-8 flex flex-row items-center justify-between">
            <span class="text-lg font-bold">{{ t('past_bookings') }}</span>
            <Icon name="dropdown" class="cursor-pointer" :class="{ 'rotate-180': showPast }" @click="showPast = !showPast" />
          </div>
          <div v-if="showPast">
            <div v-for="(group, date) in pastBookings" :key="date">
              <p data-test="groupByDates" class="ml-2 font-bold">
                {{ dayjs(group[0]!.start).format('D MMM. YYYY') }}
              </p>
              <BookingItem
                v-for="booking in group"
                :key="booking._id"
                :booking="booking"
                :bookables="bookableLookup"
                :spaces="spaceLookup"
                :to="`/account/booking/${booking._id}`"
                status-color="bg-gray-400"
                class="m-3"
              />
            </div>
          </div>
        </template>
      </div>
    </template>
  </AppContent>
</template>

<script setup lang="ts">
import type { Booking } from '#shared/types/models';
import dayjs from 'dayjs';

const { t } = useI18n();
const { savedSpaceId } = useSavedSpace();

useAppHeader(() => ({ actionsDesktopOnly: true, title: t('own_bookings'), back: savedSpaceId.value ? `/space/${savedSpaceId.value}` : '/spaces' }));

const { data: bookings, loading } = usePolling('my-bookings', () => $fetch<Booking[]>('/api/bookings', { query: { bookedBy: 'me' } }), { default: () => [] });

const bookableIds = computed(() => (bookings.value ?? []).map(booking => booking.bookable));
const bookableLookup = useBookableLookup(bookableIds);
const spaceLookup = useSpaceLookup();

const showPast = ref(false);

function groupByDay(list: Booking[]): Record<string, Booking[]> {
  const groups: Record<string, Booking[]> = {};
  for (const booking of list) {
    const key = dayjs(booking.start).format('YYYY-MM-DD');
    (groups[key] ??= []).push(booking);
  }
  return groups;
}

const upcomingBookings = computed(() =>
  groupByDay([...(bookings.value ?? [])].filter(b => dayjs(b.end).isAfter(new Date())).sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())),
);

const pastBookings = computed(() =>
  groupByDay([...(bookings.value ?? [])].filter(b => dayjs(b.end).isBefore(new Date())).sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf())),
);

const noBookings = computed(() => Object.keys(upcomingBookings.value).length === 0);
</script>
