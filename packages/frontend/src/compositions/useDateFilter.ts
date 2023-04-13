import { computed, onMounted, Ref, ref } from 'vue';

export type DateFilter = { start?: Date; end?: Date };

const dateFilter: Ref<DateFilter> = ref({
  start: undefined,
  end: undefined,
});

export const useDateFilter = (): {
  dateFilter: Ref<DateFilter>;
  resetDateFilter: () => void;
  hasActiveFilter: Ref<boolean>;
} => {
  const resetDateFilter = () => {
    dateFilter.value = {
      start: undefined,
      end: undefined,
    };
  };

  onMounted(() => {
    if (dateFilter.value === undefined) {
      resetDateFilter();
    }
  });

  const hasActiveFilter = computed(() => !!dateFilter.value?.start && !!dateFilter.value?.end);

  return {
    dateFilter,
    resetDateFilter,
    hasActiveFilter,
  };
};
