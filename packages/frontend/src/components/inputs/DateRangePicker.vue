<template>
  <div class="flex flex-row">
    <div class="flex flex-col flex-grow">
      <InputField icon-name="play">
        <DateTimePicker
          :model-value="internalStart"
          :placeholder="t('start')"
          :min-date="new Date()"
          @update:model-value="changeStartDate"
        />
      </InputField>

      <InputField icon-name="stop">
        <DateTimePicker v-model="internalEnd" :placeholder="t('end')" :min-date="new Date()" />
      </InputField>
    </div>
    <slot />
  </div>

  <div class="flex flex-row justify-center items-center my-2">
    <InfoBox class="mr-2">
      {{ t('booking_drag') }}
    </InfoBox>
    <ButtonPair
      icon-left="chevron-left"
      icon-right="chevron-right"
      :disabled-left="dayjs(viewStartDate).isSame(dayjs(), 'day')"
      @left="api!.prev()"
      @right="api!.next()"
    />
  </div>
  <FullCalendar ref="fullCalendar" :options="calendarOptions" class="full-calendar" />
</template>

<script lang="ts">
import '@fullcalendar/core/vdom';

import { Model } from '@bookyp/core';
import { Calendar, CalendarOptions } from '@fullcalendar/core';
import deLocale from '@fullcalendar/core/locales/de';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/vue3';
import dayjs, { ConfigType } from 'dayjs';
import { computed, defineComponent, onMounted, PropType, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ButtonPair from '~/components/buttons/ButtonPair.vue';
import InfoBox from '~/components/InfoBox.vue';
import InputField from '~/components/InputField.vue';
import DateTimePicker from '~/components/inputs/DateTimePicker.vue';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';

export default defineComponent({
  name: 'DateRangePicker',
  components: {
    ButtonPair,
    FullCalendar,
    InfoBox,
    InputField,
    DateTimePicker,
  },

  props: {
    bookings: {
      type: Array as PropType<Model.Booking[]>,
      required: true,
    },

    start: {
      type: [Object, String, Number] as PropType<ConfigType>,
      required: true,
    },

    end: {
      type: [Object, String, Number] as PropType<ConfigType>,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:start': (__value: Date) => true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:end': (__value: Date) => true,
  },

  setup(props, { emit }) {
    const bookings = toRef(props, 'bookings');
    const start = toRef(props, 'start');
    const end = toRef(props, 'end');
    const { t } = useI18n();
    const { bookablesFilter } = useBookablesFilter();

    const viewStartDate = ref<Date>();
    const hasActiveBookablesFilter = computed(() => !bookablesFilter.value?.quickFilterEnabled);

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
        emit('update:start', date);
      },
    });

    const internalEnd = computed<Date>({
      get() {
        return dayjs(end.value).toDate();
      },
      set(date) {
        emit('update:end', date);
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
      height: '70vh',
      headerToolbar: false,
      initialView: 'timeGridFourDay',
      initialDate: !hasActiveBookablesFilter.value ? dayjs().toISOString() : bookablesFilter.value?.start,
      nowIndicator: true,
      validRange: {
        start: dayjs().toISOString(),
      },
      datesSet: ({ start: _start }) => {
        viewStartDate.value = _start;
      },
      scrollTime: dayjs(start.value).format('HH:mm'),
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
      selectable: true,
      selectOverlap: false,
      select: ({ start: _start, end: _end }) => {
        emit('update:start', _start);
        emit('update:end', _end);
        api.value?.unselect();
      },
      longPressDelay: 300,
      events: [
        ...bookings.value.map((booking) => ({
          color: 'rgba(220,38,38,1)',
          title: booking.description || '',
          start: dayjs(booking.start).toISOString(),
          end: dayjs(booking.end).toISOString(),
          display: 'background',
        })),
        {
          color: 'rgba(5,150,105,1)',
          title: 'Booking',
          start: dayjs(start.value).toISOString(),
          end: dayjs(end.value).toISOString(),
          editable: true,
        },
      ],
    }));

    return { calendarOptions, fullCalendar, api, t, viewStartDate, dayjs, internalStart, internalEnd, changeStartDate };
  },
});
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

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type vue-scoped-css/require-scoped -->
<style>
:root {
  --fc-today-bg-color: rgba(156, 163, 176, 0.15);
  --fc-now-indicator-color: #f59e0b;
  --fc-small-font-size: 0.8rem;
  --fc-highlight-color: rgba(5, 150, 105, 0.4);
}
</style>
