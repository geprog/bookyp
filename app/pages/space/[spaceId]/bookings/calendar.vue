<template>
  <SpaceBookingsHeaderActions active="calendar" />

  <div class="mx-2 mb-4 flex grow flex-col md:mx-8">
    <div class="my-2 flex flex-col items-center gap-2 md:flex-row md:justify-between">
      <div class="flex gap-2">
        <AppButton :outlined="selectedView === 'timeGridDay'" class="md:hidden" @click="selectedView = 'timeGridDay'">
          {{ t('calendar.day') }}
        </AppButton>
        <AppButton :outlined="selectedView === 'timeGridWorkWeek'" class="hidden md:block" @click="selectedView = 'timeGridWorkWeek'">
          {{ t('calendar.work_week') }}
        </AppButton>
        <AppButton :outlined="selectedView === 'timeGridWeek'" class="hidden md:block" @click="selectedView = 'timeGridWeek'">
          {{ t('calendar.week') }}
        </AppButton>
        <AppButton :outlined="selectedView === 'dayGridMonth'" @click="selectedView = 'dayGridMonth'">
          {{ t('calendar.month') }}
        </AppButton>
      </div>
      <div class="flex gap-2">
        <AppButton @click="api?.today()">
          {{ t('calendar.today') }}
        </AppButton>
        <ButtonPair icon-left="i-bookyp-chevron-left" icon-right="i-bookyp-chevron-right" @left="api?.prev()" @right="api?.next()" />
      </div>
    </div>

    <div class="min-h-[60vh] grow">
      <FullCalendar ref="fullCalendar" :options="calendarOptions" class="full-calendar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import type { Booking } from '#shared/types/models';
import deLocale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import dayjs from 'dayjs';

const { t } = useI18n();
const { spaceId } = useCurrentSpace();
const { user } = useAuth();

useAppHeader(() => ({ menu: 'footer', title: t('bookings'), back: `/space/${spaceId.value}/bookables/map` }));

const range = ref<{ start: Date; end: Date }>({ start: dayjs().startOf('month').toDate(), end: dayjs().endOf('month').toDate() });

const { data: bookings } = usePolling(
  () => `bookings:${spaceId.value}:calendar`,
  () => $fetch<Booking[]>('/api/bookings', { query: { space: spaceId.value, from: range.value.start.toISOString(), to: range.value.end.toISOString() } }),
  { watch: [spaceId, range], default: () => [] },
);

const bookableIds = computed(() => (bookings.value ?? []).map(b => b.bookable));
const bookableLookup = useBookableLookup(bookableIds);

const fullCalendar = ref<InstanceType<typeof FullCalendar>>();
const api = computed<Calendar | undefined>(() => fullCalendar.value?.getApi());

type View = 'timeGridDay' | 'timeGridWeek' | 'timeGridWorkWeek' | 'dayGridMonth';
const selectedView = ref<View>('timeGridWeek');
watch(selectedView, value => api.value?.changeView(value));

const { width } = useWindowSize();
watch(width, () => {
  if (width.value < 768 && selectedView.value !== 'timeGridDay' && selectedView.value !== 'dayGridMonth') {
    selectedView.value = 'timeGridDay';
  }
  else if (width.value >= 768 && selectedView.value === 'timeGridDay') {
    selectedView.value = 'timeGridWeek';
  }
}, { immediate: true });

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [interactionPlugin, timeGridPlugin, dayGridPlugin],
  height: '100%',
  locales: [deLocale],
  locale: 'de',
  initialView: selectedView.value,
  initialDate: dayjs().toISOString(),
  nowIndicator: true,
  datesSet: ({ start, end }) => {
    range.value = { start, end };
  },
  scrollTime: dayjs().subtract(1, 'hour').format('HH:mm'),
  scrollTimeReset: false,
  slotDuration: '00:30:00',
  allDaySlot: false,
  views: {
    timeGridDay: { dayHeaderFormat: { weekday: 'long', month: 'numeric', day: 'numeric', year: 'numeric' } },
    timeGridWorkWeek: { type: 'timeGridWeek', weekends: false },
  },
  headerToolbar: false,
  eventClick: ({ event }) => {
    void navigateTo(`/account/booking/${event.id}`);
  },
  longPressDelay: 300,
  events: (bookings.value ?? []).map((booking): EventInput => {
    const isMine = booking.bookedBy === user.value?._id;
    const bookedBy = isMine ? user.value?.name || user.value?.email : booking.bookedByUser?.name || booking.bookedByUser?.email;
    return {
      id: booking._id,
      color: booking.request ? 'rgba(255, 202, 40, 1)' : 'rgba(248, 113, 113, 1)',
      title: `${bookableLookup.value.get(booking.bookable)?.name ?? ''} - ${bookedBy ?? ''}`,
      start: dayjs(booking.start).toISOString(),
      end: dayjs(booking.end).toISOString(),
      classNames: isMine ? ['cursor-pointer', 'orange-glow'] : ['cursor-pointer'],
    };
  }),
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
.full-calendar :deep(.orange-glow) {
  filter: drop-shadow(-2px -2px 4px rgba(245, 158, 11, 0.5)) drop-shadow(2px 2px 4px rgba(245, 162, 11, 0.5));
}
</style>
