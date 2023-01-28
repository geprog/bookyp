<template>
  <div class="flex flex-row">
    <div class="flex flex-col flex-grow">
      <LabelField icon-name="play">
        <DateTimePicker
          :model-value="internalStart"
          :placeholder="t('start')"
          :min-date="new Date()"
          @update:model-value="changeStartDate"
        />
      </LabelField>

      <LabelField icon-name="stop">
        <DateTimePicker v-model="internalEnd" :placeholder="t('end')" :min-date="new Date()" />
      </LabelField>
    </div>
    <slot />
  </div>

  <div class="flex flex-row justify-center items-center my-2">
    <slot name="info-box">
      <InfoBox class="mr-2">
        {{ t('booking_drag') }}
      </InfoBox>
    </slot>
    <ButtonPair
      icon-left="chevron-left"
      icon-right="chevron-right"
      :disabled-left="dayjs(viewStartDate).isSame(dayjs(), 'day')"
      @left="api!.prev()"
      @right="api!.next()"
    />
  </div>

  <div class="flex-grow">
    <FullCalendar ref="fullCalendar" :options="calendarOptions" class="full-calendar" />
  </div>
</template>

<script lang="ts" setup>
import '@fullcalendar/core/vdom';

import { Model } from '@bookyp/core';
import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import deLocale from '@fullcalendar/core/locales/de';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import dayjs, { ConfigType } from 'dayjs';
import { computed, onMounted, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ButtonPair from '~/components/buttons/ButtonPair.vue';
import InfoBox from '~/components/InfoBox.vue';
import DateTimePicker from '~/components/inputs/DateTimePicker.vue';
import LabelField from '~/components/LabelField.vue';
import { user } from '~/compositions/useAuthentication';

const props = withDefaults(
  defineProps<{
    bookings: Model.Booking[];
    start: ConfigType;
    end: ConfigType;
    initialDate?: ConfigType;
  }>(),
  {
    initialDate: () => new Date(),
  },
);

const emit = defineEmits<{
  (event: 'update:start', __value: Date): void;
  (event: 'update:end', __value: Date): void;
  (event: 'booking:click', bookingId: Model.Ref<Model.Booking>): void;
}>();

const bookings = toRef(props, 'bookings');
const start = toRef(props, 'start');
const end = toRef(props, 'end');
const initialDate = toRef(props, 'initialDate');
const { t } = useI18n();

const viewStartDate = ref<Date>();

const fullCalendar = ref<InstanceType<typeof FullCalendar>>();
const api = ref<Calendar>();

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  api.value = fullCalendar.value!.getApi();
});

const internalStart = computed<Date>({
  get() {
    return dayjs(start.value).toDate();
  },
  set(date) {
    emit('update:start', dayjs(date).toDate());
  },
});

const internalEnd = computed<Date>({
  get() {
    return dayjs(end.value).toDate();
  },
  set(date) {
    emit('update:end', dayjs(date).toDate());
  },
});

const changeStartDate = (date: Date) => {
  const oldStart = start.value;
  internalStart.value = date;
  emit(
    'update:end',
    dayjs(date)
      .add(Math.abs(dayjs(oldStart).diff(dayjs(end.value))))
      .toDate(),
  );
};

watch(start, () => {
  if (!api.value) {
    return;
  }
  api.value.scrollToTime(dayjs(start.value).subtract(1, 'hour').format('HH:mm'));
  const calendarDate = api.value.getDate();
  if (dayjs(start.value).isBefore(calendarDate) || dayjs(start.value).isAfter(dayjs(calendarDate).add(3, 'days'))) {
    api.value.gotoDate(dayjs(start.value).toISOString());
  }
});

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [interactionPlugin, timeGridPlugin],
  locales: [deLocale],
  locale: 'de',
  height: '100%',
  headerToolbar: false,
  initialView: 'timeGridFourDay',
  initialDate: dayjs(initialDate.value).toISOString(),
  nowIndicator: true,
  validRange: {
    start: dayjs().toISOString(),
  },
  datesSet: ({ start: _start }) => {
    viewStartDate.value = _start;
  },
  scrollTime: dayjs(initialDate.value).format('HH:mm'),
  scrollTimeReset: false,
  slotDuration: '00:30:00',
  allDaySlot: false,
  views: {
    timeGridFourDay: {
      type: 'timeGrid',
      duration: { days: 3 },
      buttonText: '3 day',
    },
  },
  dateIncrement: { days: 1 },
  eventOverlap: false,
  eventDrop: ({ event }) => {
    if (event.start === null || event.end === null) {
      return;
    }
    emit('update:start', event.start);
    emit('update:end', event.end);
  },
  eventResize: ({ event }) => {
    if (event.end === null) {
      return;
    }
    emit('update:end', event.end);
  },
  eventClick: ({ event }) => {
    if (event.id) {
      emit('booking:click', event.id);
    }
  },
  selectable: true,
  selectOverlap: false,
  select: ({ start: _start, end: _end }) => {
    emit('update:start', _start);
    emit('update:end', _end);
    api.value?.unselect();
  },
  longPressDelay: 300,
  events: [
    ...bookings.value.map((booking) => {
      const classNames = ['cursor-pointer'];

      if (booking.bookedBy === user.value?._id) {
        classNames.push('filter', 'drop-shadow-orangeGlow');
      }

      return <EventInput>{
        id: booking._id,
        color: 'rgba(248, 113, 113, 1)',
        title: booking.description || '',
        start: dayjs(booking.start).toISOString(),
        end: dayjs(booking.end).toISOString(),
        classNames,
      };
    }),
    {
      color: 'rgba(5,150,105,1)',
      title: 'Booking',
      start: dayjs(start.value).toISOString(),
      end: dayjs(end.value).toISOString(),
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
</style>
