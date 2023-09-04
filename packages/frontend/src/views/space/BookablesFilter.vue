<template>
  <Header :title="t('filter_bookables')" :back-fallback="{ name: 'bookables-map' }">
    <template #right>
      <IconButton type="submit" form="filterBookablesForm" icon="check-mark" />
    </template>
  </Header>
  <AppContent>
    <form id="filterBookablesForm" class="my-2 flex flex-col flex-grow" @submit.prevent="submitBookablesFilter">
      <DateRangePicker v-model:start="start" v-model:end="end" :bookings="[]" :initial-date="start">
        <Button v-if="hasActiveBookablesFilter" icon="dismiss" outlined class="ml-4 px-1" @click="reset" />
      </DateRangePicker>
    </form>
  </AppContent>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import DateRangePicker from '~/components/inputs/DateRangePicker.vue';
import AppContent from '~/components/layout/AppContent.vue';
import { useBack } from '~/compositions/useBack';
import { useBookables } from '~/compositions/useBookables';

const { t } = useI18n();
const { combinedFilter, dateFilter, quickFilterDiffMinutes, resetBookablesFilter } = useBookables();
const { back } = useBack();

const hasActiveBookablesFilter = computed(() => dateFilter.value.start);

const start = ref<Date>(combinedFilter.value?.start || new Date());

const defaultEndDate = dayjs(start.value).add(2, 'hour').toDate();

const end = ref<Date>(combinedFilter.value?.end || defaultEndDate);

const submitBookablesFilter = () => {
  dateFilter.value = {
    start: dayjs(start.value).toDate(),
    end: dayjs(end.value).toDate(),
  };
  quickFilterDiffMinutes.value = undefined;
  void back({ name: 'bookables-map' });
};

const reset = () => {
  resetBookablesFilter();
  void back({ name: 'bookables-map' });
};
</script>
