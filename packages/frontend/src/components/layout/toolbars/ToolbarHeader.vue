<template>
  <div class="fixed place-self-center w-full max-w-3xl flex justify-between p-6 z-50 mt-12">
    <div class="relative">
      <span
        v-if="appliedFilters > 0"
        class="
          absolute
          left-1
          top-0.5
          bg-primary-normal
          rounded-full
          w-4
          h-4
          text-center text-xs text-white
          cursor-pointer
        "
        @click="$router.push({ name: `${actionFor}-filter` })"
        >{{ appliedFilters }}</span
      >
      <FloatingButton
        icon="filter"
        text="Filter"
        back-ground-color="white"
        @click="$router.push({ name: `${actionFor}-filter` })"
      />
    </div>
    <div>
      <ToggleBar
        :selected="$route.name === `${actionFor}-map` ? 'start' : 'end'"
        start-icon="map"
        end-icon="apps-list"
        @selected-start="$router.replace({ name: `${actionFor}-map` })"
        @selected-end="$router.replace({ name: `${actionFor}-list` })"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, toRef } from 'vue';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import ToggleBar from '~/components/buttons/ToggleBar.vue';
import { useBookables } from '~/compositions/useBookables';
import { useDateFilter } from '~/compositions/useDateFilter';

const props = withDefaults(
  defineProps<{
    actionFor: 'bookables' | 'spaces';
  }>(),
  {},
);

const actionFor = toRef(props, 'actionFor');

const { dateFilter, quickFilter, quickFilterDiffMinutes } = useBookables();

const { hasActiveFilter } = useDateFilter();

onMounted(() => {
  if (!quickFilter.value?.start && !dateFilter.value?.start) {
    quickFilterDiffMinutes.value = 2 * 60;
  }
});

const appliedFilters = computed(() => {
  if (actionFor.value === 'bookables') {
    return dateFilter.value?.start ? 1 : 0;
  }
  return hasActiveFilter.value ? 1 : 0;
});
</script>
