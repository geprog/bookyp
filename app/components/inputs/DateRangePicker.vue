<template>
  <div class="flex flex-row">
    <div class="flex grow flex-col">
      <IconField icon="i-bookyp-play">
        <DateTimeInput :model-value="start" :placeholder="t('start')" :min-date="new Date()" data-test="form-start" @update:model-value="changeStartDate" />
      </IconField>
      <IconField icon="i-bookyp-stop">
        <DateTimeInput :model-value="end" :placeholder="t('end')" :min-date="start" data-test="form-end" @update:model-value="emit('update:end', $event)" />
      </IconField>
    </div>
    <slot />
  </div>

  <div class="my-2 flex flex-row items-center justify-center">
    <slot name="info-box">
      <InfoBox class="mr-2">
        {{ t('booking_drag') }}
      </InfoBox>
    </slot>
    <ButtonPair
      icon-left="i-bookyp-chevron-left"
      icon-right="i-bookyp-chevron-right"
      :disabled-left="dayjs(viewStartDate).isSame(dayjs(), 'day')"
      @left="api?.prev()"
      @right="api?.next()"
    />
  </div>

  <div class="min-h-96 grow">
    <FullCalendar ref="fullCalendar" :options="calendarOptions" class="full-calendar" />
  </div>
</template>

<script setup lang="ts">
import type { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import type { Booking, ForeignBooking } from '#shared/types/models';
import deLocale from '@fullcalendar/core/locales/de';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import dayjs from 'dayjs';

/**
 * Selects a time range: two inputs plus a 3 day calendar where the range can be dragged.
 * Existing bookings of the bookable are shown, so free slots are visible.
 */
const props = withDefaults(defineProps<{
  bookings: (Booking | ForeignBooking)[];
  start: Date;
  end: Date;
  initialDate?: Date;
}>(), {
  initialDate: () => new Date(),
});

const emit = defineEmits<{
  'update:start': [value: Date];
  'update:end': [value: Date];
  'booking:click': [bookingId: string];
}>();

const { t } = useI18n();
const { user } = useAuth();

const viewStartDate = ref<Date>();
const fullCalendar = ref<InstanceType<typeof FullCalendar>>();
const api = computed<Calendar | undefined>(() => fullCalendar.value?.getApi());

function changeStartDate(date: Date) {
  const duration = Math.abs(dayjs(props.start).diff(dayjs(props.end)));
  emit('update:start', date);
  emit('update:end', dayjs(date).add(duration).toDate());
}

watch(() => props.start, (start) => {
  if (!api.value) {
    return;
  }
  api.value.scrollToTime(dayjs(start).subtract(1, 'hour').format('HH:mm'));
  const calendarDate = api.value.getDate();
  if (dayjs(start).isBefore(calendarDate) || dayjs(start).isAfter(dayjs(calendarDate).add(3, 'days'))) {
    api.value.gotoDate(dayjs(start).toISOString());
  }
});

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [interactionPlugin, timeGridPlugin],
  locales: [deLocale],
  locale: 'de',
  height: '100%',
  headerToolbar: false,
  initialView: 'timeGridThreeDays',
  initialDate: dayjs(props.initialDate).toISOString(),
  nowIndicator: true,
  // like v1 the calendar starts now, earlier slots of today cannot be selected
  validRange: { start: dayjs().toISOString() },
  datesSet: ({ start }) => {
    viewStartDate.value = start;
  },
  scrollTime: dayjs(props.initialDate).subtract(1, 'hour').format('HH:mm'),
  scrollTimeReset: false,
  slotDuration: '00:30:00',
  allDaySlot: false,
  views: {
    timeGridThreeDays: { type: 'timeGrid', duration: { days: 3 } },
  },
  dateIncrement: { days: 1 },
  eventOverlap: false,
  eventDrop: ({ event }) => {
    if (event.start && event.end) {
      emit('update:start', event.start);
      emit('update:end', event.end);
    }
  },
  eventResize: ({ event }) => {
    if (event.end) {
      emit('update:end', event.end);
    }
  },
  eventClick: ({ event }) => {
    if (event.id) {
      emit('booking:click', event.id);
    }
  },
  selectable: true,
  selectOverlap: false,
  select: ({ start, end }) => {
    emit('update:start', start);
    emit('update:end', end);
    api.value?.unselect();
  },
  longPressDelay: 300,
  events: [
    ...props.bookings.map((booking): EventInput => {
      const isMine = 'bookedBy' in booking && booking.bookedBy === user.value?._id;
      return {
        id: booking._id,
        color: booking.request ? 'rgba(255, 202, 40, 1)' : 'rgba(248, 113, 113, 1)',
        title: ('description' in booking && booking.description) || '',
        start: dayjs(booking.start).toISOString(),
        end: dayjs(booking.end).toISOString(),
        classNames: isMine ? ['cursor-pointer', 'orange-glow'] : ['cursor-pointer'],
      };
    }),
    {
      color: 'rgba(5,150,105,1)',
      title: t('booking'),
      start: dayjs(props.start).toISOString(),
      end: dayjs(props.end).toISOString(),
      editable: true,
    },
  ],
}));
</script>

<style scoped>
.full-calendar :deep(table) {
  border: none;
  font-size: 0.8rem;
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
