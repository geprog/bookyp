<template>
  <Header :title="t('filter_spaces')">
    <template #start>
      <IconButton icon="dismiss" @click="$router.back()" />
    </template>
    <IconButton type="submit" form="filterBookablesForm" icon="check-mark" />
  </Header>

  <AppContent>
    <form id="filterBookablesForm" class="my-2 flex flex-col flex-grow" @submit.prevent="submitBookablesFilter">
      <DateRangePicker v-model:start="start" v-model:end="end" :bookings="[]" :initial-date="start">
        <Button v-if="hasActiveFilter" icon="dismiss" outlined class="ml-4 px-1" @click="reset" />
      </DateRangePicker>
    </form>
  </AppContent>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import DateRangePicker from '~/components/inputs/DateRangePicker.vue';
import AppContent from '~/components/layout/AppContent.vue';
import { useDateFilter } from '~/compositions/useDateFilter';

const { t } = useI18n();
const router = useRouter();
const { dateFilter, resetDateFilter, hasActiveFilter } = useDateFilter();

const start = ref<Date>(dateFilter.value?.start || new Date());

const defaultEndDate = dayjs(start.value).add(2, 'hour').toDate();
const end = ref<Date>(dateFilter.value?.end || defaultEndDate);

const submitBookablesFilter = () => {
  dateFilter.value = {
    start: dayjs(start.value).toDate(),
    end: dayjs(end.value).toDate(),
  };
  router.back();
};

const reset = () => {
  resetDateFilter();
  router.back();
};
</script>
