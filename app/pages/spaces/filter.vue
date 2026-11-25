<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton type="submit" form="filterSpacesForm" icon="check-mark" :label="t('filter')" data-test="submit-filter" />
  </Teleport>

  <AppContent>
    <form id="filterSpacesForm" class="my-2 flex grow flex-col" @submit.prevent="submit">
      <DateRangePicker v-model:start="start" v-model:end="end" :bookings="[]" :initial-date="start">
        <AppButton v-if="hasActiveFilter" icon="dismiss" :aria-label="t('dialog.cancel')" outlined class="ml-4 self-start" @click="reset" />
      </DateRangePicker>
    </form>
  </AppContent>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';

definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
const { back } = useBack();
const { dateFilter, resetDateFilter, hasActiveFilter } = useDateFilter();

useAppHeader(() => ({ menu: 'none', title: t('filter_spaces'), back: '/spaces' }));

const start = ref<Date>(dateFilter.value.start ?? new Date());
const end = ref<Date>(dateFilter.value.end ?? dayjs(start.value).add(2, 'hour').toDate());

function submit() {
  dateFilter.value = { start: start.value, end: end.value };
  void back('/spaces');
}

function reset() {
  resetDateFilter();
  void back('/spaces');
}
</script>
