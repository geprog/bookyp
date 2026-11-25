export interface DateFilter {
  start?: Date;
  end?: Date;
}

/** the time range the user is looking for a free bookable in (shared between the spaces and the bookables views) */
export function useDateFilter() {
  const dateFilter = useState<DateFilter>('dateFilter', () => ({}));

  const hasActiveFilter = computed(() => !!dateFilter.value.start && !!dateFilter.value.end);

  function resetDateFilter(): void {
    dateFilter.value = {};
  }

  return { dateFilter, hasActiveFilter, resetDateFilter };
}
