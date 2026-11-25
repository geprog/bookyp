<template>
  <AppContent class="flex-col">
    <Spinner v-if="!bookingError && (!booking || (!bookable && !spaceUnavailable))" />
    <template v-else-if="booking">
      <div class="my-3 mr-2 ml-2 flex flex-col gap-y-2 rounded-lg bg-white p-4 shadow-full">
        <div class="flex items-center justify-between">
          <p :class="booking.request ? 'text-gray-400 italic' : ''" data-test="booking-bookable">
            {{ bookable?.name }}
          </p>
          <p v-if="booking.request" class="text-gray-400 italic">
            {{ t('requested') }}
          </p>
        </div>
        <div v-if="booking.deleted" class="my-2 flex flex-row items-center justify-center">
          <InfoBox class="mr-2 flex flex-col bg-red-400 text-white">
            <p>{{ booking.request ? t('deleted_request') : t('deleted_booking') }}</p>
          </InfoBox>
        </div>
        <div v-if="spaceUnavailable" class="my-2 flex flex-row items-center justify-center" data-test="space-unavailable">
          <InfoBox class="mr-2 flex flex-col bg-red-400 text-white">
            <p>{{ t('booking_space_unavailable') }}</p>
          </InfoBox>
        </div>
        <div>
          <NuxtLink v-if="space" :to="`/space/${space._id}`" class="cursor-pointer text-sm text-gray-500 italic">
            {{ space.name }}
          </NuxtLink>
        </div>

        <div class="grid grid-cols-[auto_1fr] gap-1 text-sm text-gray-500">
          <span class="italic">{{ t('start') }}:</span><span>{{ dayjs(booking.start).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
          <span class="italic">{{ t('end') }}:</span><span>{{ dayjs(booking.end).format('ddd, DD. MMM. YYYY - HH:mm') }}</span>
          <span class="italic">{{ t('description') }}:</span>
          <pre>{{ booking.description }}</pre>
        </div>
        <div v-if="booking.bookedByUser" class="mt-1 grid grid-cols-[auto_1fr] gap-1 text-sm md:mt-2">
          <template v-if="booking.bookedByUser.name">
            <span>{{ t('name') }}:</span><span>{{ booking.bookedByUser.name }}</span>
          </template>
          <span>{{ t('email') }}:</span>
          <a class="text-blue-600 underline" :href="`mailto:${booking.bookedByUser.email}`">{{ booking.bookedByUser.email }}</a>
        </div>
      </div>
      <div v-if="space" class="my-2 mr-2 ml-2 flex max-h-100 flex-col gap-y-1 rounded-lg bg-white p-3 shadow-full md:p-6">
        <SpaceMap>
          <FloorPlan :floor-plan="space.floorPlan" />
          <MapObjects mode="highlight" :highlighted-bookable-id="booking.bookable" :space-id="space._id" />
        </SpaceMap>
      </div>
    </template>
  </AppContent>
  <div v-if="canChangeBooking" class="flex w-full justify-center">
    <div class="fixed bottom-18 mb-1 flex w-full max-w-5xl justify-between px-4 md:bottom-5">
      <FloatingButton class="text-sm" icon="i-bookyp-delete" :text="t('delete_booking')" background-color="white" foreground-color="red" data-test="delete-button" @click="deleteBooking" />
      <FloatingButton class="text-sm" icon="i-bookyp-edit" :text="t('edit_booking')" data-test="edit-button" @click="editBooking" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bookable, Booking, ForeignBooking } from '#shared/types/models';
import dayjs from 'dayjs';

/** users that did not book it only get the time slot of a booking (like v1) */
type BookingDetails = ForeignBooking & Partial<Booking>;

const { t } = useI18n();
const route = useRoute();
const { user } = useAuth();
const { api, showError } = useApi();
const { openDialog } = useDialog();
const { back } = useBack();

useAppHeader(() => ({ menu: 'footer', title: t('booking_details'), back: '/account/bookings' }));

const bookingId = computed(() => route.params.bookingId as string);
const { data: booking, error: bookingError } = usePolling(() => `booking:${bookingId.value}`, () => $fetch<BookingDetails>(`/api/bookings/${bookingId.value}`), { watch: [bookingId] });

const spaceId = computed(() => booking.value?.space);
const { data: space, error: spaceError } = useSpace(spaceId);

const { data: bookable, error: bookableError } = useApiData(
  () => `bookable:${booking.value?.bookable}`,
  async () => (booking.value ? await $fetch<Bookable>(`/api/bookables/${booking.value.bookable}`) : null),
  { watch: [() => booking.value?.bookable] },
);

// the space was deleted (or the user lost access to it): the booking is shown without bookable and map
const spaceUnavailable = computed(() => !!spaceError.value || !!bookableError.value);

const isAdmin = computed(() => space.value?.role === 'admin' || !!user.value?.isSuperAdmin);
const canChangeBooking = computed(() => !!user.value && !!booking.value && !booking.value.deleted && !spaceUnavailable.value && (isAdmin.value || booking.value.bookedBy === user.value._id));

async function editBooking() {
  if (!booking.value) {
    return;
  }
  await navigateTo(`/space/${booking.value.space}/bookable/${booking.value.bookable}/booking/edit/${booking.value._id}`);
}

async function deleteBooking() {
  if (!(await openDialog({ title: t('delete'), description: t('delete_dialog_description', { objectLabel: t('booking') }), confirm: t('delete'), confirmColor: 'error' }))) {
    return;
  }
  try {
    await api(`/api/bookings/${bookingId.value}`, { method: 'DELETE' });
    await back('/account/bookings');
  }
  catch (error) {
    showError(error);
  }
}
</script>
