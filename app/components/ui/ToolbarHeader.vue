<template>
  <!-- filter button and map / list toggle floating over the content -->
  <div class="pointer-events-none fixed z-10 mt-12 flex w-full max-w-3xl place-self-center justify-between p-6 md:mt-24">
    <div class="relative">
      <span
        v-if="appliedFilters > 0"
        class="pointer-events-auto absolute top-0.5 left-1 size-4 cursor-pointer rounded-full bg-amber-500 text-center text-xs text-white"
        @click="navigateTo(filterRoute)"
      >{{ appliedFilters }}</span>
      <FloatingButton class="pointer-events-auto" icon="i-bookyp-filter" :text="t('filter')" background-color="white" data-test="filter-button" @click="navigateTo(filterRoute)" />
    </div>
    <ToggleBar
      class="pointer-events-auto"
      :selected="selected"
      start-icon="i-bookyp-map"
      end-icon="i-bookyp-apps-list"
      @select="(value: 'start' | 'end') => navigateTo(value === 'start' ? mapRoute : listRoute, { replace: true })"
    />
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

defineProps<{
  selected: 'start' | 'end';
  mapRoute: RouteLocationRaw;
  listRoute: RouteLocationRaw;
  filterRoute: RouteLocationRaw;
  appliedFilters: number;
}>();

const { t } = useI18n();
</script>
