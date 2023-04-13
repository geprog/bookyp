<template>
  <div class="fixed bottom-0 w-full flex justify-center items-end space-x-8 mb-4">
    <ToggleBar
      :selected="$route.name === 'bookables-map' ? 'start' : 'end'"
      start-icon="map"
      end-icon="apps-list"
      @selected-start="$router.replace({ name: 'bookables-map' })"
      @selected-end="$router.replace({ name: 'bookables-list' })"
    />

    <HourControlButton v-if="!dateFilter.start && quickFilter" v-model:end-date="bookablesFilterEndDate" />
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, onMounted } from 'vue';

import HourControlButton from '~/components/buttons/HourControlButton.vue';
import ToggleBar from '~/components/buttons/ToggleBar.vue';
import { ceilDate, useBookables } from '~/compositions/useBookables';

const { dateFilter, quickFilter, quickFilterDiffMinutes } = useBookables();

const bookablesFilterEndDate = computed<Date>({
  get() {
    return quickFilter.value.end || ceilDate(dayjs().add(2, 'hour').toDate(), 15, 'minutes');
  },
  set(value) {
    const diff = dayjs(quickFilter.value.end).diff(ceilDate(value, 15, 'minutes'), 'minutes') * -1;
    quickFilterDiffMinutes.value = (quickFilterDiffMinutes.value || 0) + diff;
  },
});

onMounted(() => {
  if (!quickFilter.value?.start && !dateFilter.value?.start) {
    quickFilterDiffMinutes.value = 2 * 60;
  }
});
</script>
