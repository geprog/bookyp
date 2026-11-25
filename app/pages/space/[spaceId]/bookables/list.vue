<template>
  <ToolbarHeader
    selected="end"
    :map-route="`/space/${spaceId}/bookables/map`"
    :list-route="`/space/${spaceId}/bookables/list`"
    :filter-route="`/space/${spaceId}/bookables/filter`"
    :applied-filters="dateFilter.start ? 1 : 0"
  />
  <AppContent class="flex-col">
    <Spinner v-if="loading" />
    <div v-else-if="bookablesWithFilterMatched.length" class="pb-25">
      <h2 class="mt-6 font-bold">
        {{ t('available_bookables') }}
      </h2>
      <ListItem
        v-for="bookable in availableBookables"
        :key="bookable._id"
        :label="bookable.name"
        status-color="bg-emerald-600"
        :description="bookable.description"
        class="my-3"
        data-test="bookable-list-item"
        :to="`/space/${spaceId}/bookable/${bookable._id}/booking`"
      />

      <h2 class="mt-6 font-bold">
        {{ t('occupied_bookables') }}
      </h2>
      <ListItem
        v-for="bookable in occupiedBookables"
        :key="bookable._id"
        :label="bookable.name"
        :status-color="isRequested(bookable._id) ? 'bg-primary' : 'bg-red-600'"
        :description="bookable.description"
        class="my-3"
        :class="borderStyle(bookable._id)"
        data-test="bookable-list-item"
        :to="`/space/${spaceId}/bookable/${bookable._id}/booking`"
      />
    </div>
  </AppContent>
</template>

<script setup lang="ts">
definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
const { space, spaceId } = useCurrentSpace();
const { dateFilter } = useDateFilter();
const { bookablesWithFilterMatched, loading, isBookedByMe, isRequested, isRequestedByMe } = useBookables(spaceId);

useAppHeader(() => ({ title: space.value.name, back: '/spaces', menu: 'plain' }));

const availableBookables = computed(() => bookablesWithFilterMatched.value.filter(bookable => bookable.isFilterMatched));
const occupiedBookables = computed(() => bookablesWithFilterMatched.value.filter(bookable => !bookable.isFilterMatched));

function borderStyle(bookableId: string): string | undefined {
  if (isRequestedByMe(bookableId)) {
    return 'shadow-orange-glow border-2 border-amber-500';
  }
  if (isBookedByMe(bookableId)) {
    return 'shadow-orange-glow border border-amber-500';
  }
  return undefined;
}
</script>
