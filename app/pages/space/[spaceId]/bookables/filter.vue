<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton type="submit" form="filterBookablesForm" icon="check-mark" :label="t('filter')" data-test="submit-filter" />
  </Teleport>
  <AppContent>
    <form id="filterBookablesForm" class="my-2 flex grow flex-col" @submit.prevent="submit">
      <DateRangePicker v-model:start="start" v-model:end="end" :bookings="[]" :initial-date="start">
        <AppButton v-if="dateFilter.start" icon="dismiss" :aria-label="t('dialog.cancel')" outlined class="ml-4 self-start" @click="reset" />
      </DateRangePicker>
    </form>
  </AppContent>
</template>

<script setup lang="ts">
definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
const { back } = useBack();
const { spaceId } = useCurrentSpace();
const { dateFilter, combinedFilter, resetBookablesFilter } = useBookables(spaceId);

useAppHeader(() => ({ menu: 'none', title: t('filter_bookables'), back: `/space/${spaceId.value}/bookables/map` }));

const start = ref<Date>(combinedFilter.value.start);
const end = ref<Date>(combinedFilter.value.end);

function submit() {
  dateFilter.value = { start: start.value, end: end.value };
  void back(`/space/${spaceId.value}/bookables/map`);
}

function reset() {
  resetBookablesFilter();
  void back(`/space/${spaceId.value}/bookables/map`);
}
</script>
