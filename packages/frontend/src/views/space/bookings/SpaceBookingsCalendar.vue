<template>
  <SpaceBookingsHeader />

  <div class="flex flex-col mx-8 mb-4 flex-grow">
    <div class="flex flex-col items-center md:flex-row md:justify-between my-2 gap-2">
      <div class="flex gap-2">
        <Button
          class="md:hidden"
          :text="t('calendar.day')"
          :outlined="selectedView === 'timeGridDay'"
          @click="selectedView = 'timeGridDay'"
        />
        <Button
          class="hidden md:block"
          :text="t('calendar.work_week')"
          :outlined="selectedView === 'timeGridWorkWeek'"
          @click="selectedView = 'timeGridWorkWeek'"
        />
        <Button
          class="hidden md:block"
          :text="t('calendar.week')"
          :outlined="selectedView === 'timeGridWeek'"
          @click="selectedView = 'timeGridWeek'"
        />
        <Button
          :text="t('calendar.month')"
          :outlined="selectedView === 'dayGridMonth'"
          @click="selectedView = 'dayGridMonth'"
        />
      </div>
      <div class="flex gap-2">
        <Button :text="t('calendar.today')" @click="api!.today()" />
        <ButtonPair
          icon-left="chevron-left"
          icon-right="chevron-right"
          :disabled-left="dayjs(viewStartDate).isSame(dayjs(), 'day')"
          @left="api!.prev()"
          @right="api!.next()"
        />
      </div>
    </div>

    <div class="flex-grow">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" class="full-calendar" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import '@fullcalendar/core/vdom';

import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import deLocale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import { useWindowSize } from '@vueuse/core';
import dayjs from 'dayjs';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import ButtonPair from '~/components/buttons/ButtonPair.vue';
import SpaceBookingsHeader from '~/components/headers/SpaceBookingsHeader.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const router = useRouter();
const { spaceId } = useCurrentSpace();

const { data: bookings } = useFind(
  'bookings',
  computed(() => ({ query: { space: spaceId.value } })),
);

const { data: bookables } = useFind(
  'bookables',
  computed(() => ({ query: { space: spaceId.value } })),
);

const { data: users } = useFind(
  'users',
  computed(() => ({ query: {} })),
);

const extendedBookings = computed(() =>
  bookings.value.map((booking) => ({
    ...booking,
    bookable: bookables.value.find((b) => b._id === booking.bookable),
    user: users.value.find((u) => u._id === booking.bookedBy),
  })),
);

const viewStartDate = ref<Date>();
const fullCalendar = ref<InstanceType<typeof FullCalendar>>();
const api = ref<Calendar>();
const selectedView = ref<'timeGridDay' | 'timeGridWeek' | 'timeGridWorkWeek' | 'dayGridMonth'>('timeGridWeek');
watch(selectedView, (value) => {
  api?.value?.changeView(value);
});

const { width, height } = useWindowSize();
watch(
  [width, height],
  () => {
    if (width.value < 768 && selectedView.value !== 'timeGridDay' && selectedView.value !== 'dayGridMonth') {
      selectedView.value = 'timeGridDay';
    } else if (width.value > 768 && selectedView.value === 'timeGridDay') {
      selectedView.value = 'timeGridWeek';
    }
  },
  { immediate: true },
);

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  api.value = fullCalendar.value!.getApi();
});

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [interactionPlugin, timeGridPlugin, dayGridPlugin],
  height: '100%',
  locales: [deLocale],
  locale: 'de', // TODO: use i18n locale
  initialView: selectedView.value,
  initialDate: dayjs().toISOString(),
  nowIndicator: true,
  datesSet: ({ start: _start }) => {
    viewStartDate.value = _start;
  },
  validViews:
    width.value < 768 ? ['timeGridDay', 'dayGridMonth'] : ['timeGridWeek', 'timeGridWorkWeek', 'dayGridMonth'],
  scrollTime: dayjs().format('HH:mm'),
  scrollTimeReset: false,
  slotDuration: '00:30:00',
  allDaySlot: false,
  views: {
    timeGridDay: {
      dayHeaderFormat: {
        weekday: 'long',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      },
    },
    timeGridWorkWeek: {
      type: 'timeGridWeek',
      weekends: false,
    },
  },
  headerToolbar: false,
  selectable: true,
  eventClick: ({ event }) => {
    void router.push({ name: 'account-booking', params: { bookingId: event.id } });
  },
  longPressDelay: 300,
  events: [
    ...extendedBookings.value.map((booking) => {
      const classNames = ['cursor-pointer'];

      if (booking.bookedBy === user.value?._id) {
        classNames.push('filter', 'drop-shadow-orangeGlow');
      }

      const bookedByName = booking.user?.name || booking.user?.email || '';
      const adminName = user.value?.name || user.value?.email || '';
      const title = `${booking.bookable?.name || ''} - ${
        booking.bookedBy === user.value?._id ? adminName : bookedByName
      }`;

      return <EventInput>{
        id: booking._id,
        color: 'rgba(248, 113, 113, 1)',
        title, // defined above
        start: dayjs(booking.start).toISOString(),
        end: dayjs(booking.end).toISOString(),
        classNames,
      };
    }),
  ],
}));
</script>

<style scoped>
.full-calendar :deep(table) {
  border: none;
  font-size: 1rem;
}

.full-calendar :deep(th) {
  border-top: none;
  border-left: none;
  border-right: none;
}

.full-calendar :deep(tr),
.full-calendar :deep(td) {
  border-left: none;
  border-right: none;
}
</style>
