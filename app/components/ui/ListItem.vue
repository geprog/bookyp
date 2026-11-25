<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to"
    class="flex rounded-lg bg-white p-3 shadow-full"
    :class="{ 'cursor-pointer': to || clickable }"
  >
    <div class="flex shrink-0">
      <slot name="start">
        <div class="w-2 rounded" :class="statusColor" />
      </slot>
    </div>
    <slot>
      <div class="ml-3 flex min-w-0 grow">
        <div class="flex min-w-0 grow flex-col space-y-1 py-1">
          <span v-if="label" data-test="label" class="truncate text-base" :class="disabled ? 'text-gray-500' : 'text-gray-900'">{{ label }}</span>
          <span v-if="description" data-test="description" class="w-full truncate text-sm" :class="disabled ? 'text-gray-400' : 'text-gray-500'">{{ description }}</span>
        </div>
        <div v-if="$slots.end" class="ml-3 flex items-center">
          <slot name="end" />
        </div>
      </div>
    </slot>
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { NuxtLink } from '#components';

withDefaults(defineProps<{
  label?: string;
  description?: string;
  /** tailwind background class of the status bar on the left */
  statusColor?: string;
  disabled?: boolean;
  to?: RouteLocationRaw;
  clickable?: boolean;
}>(), {
  label: '',
  description: '',
  statusColor: 'bg-primary',
  to: undefined,
});
</script>
