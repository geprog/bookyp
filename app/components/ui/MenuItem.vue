<template>
  <component
    :is="href ? 'a' : NuxtLink"
    :href="href"
    :to="to"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    class="flex items-center gap-2 border-gray-300 py-4 hover:text-primary"
  >
    <Icon v-if="icon" :name="icon.replace('i-bookyp-', '')" />
    <div class="flex flex-col">
      <span v-if="title">{{ title }}</span>
      <span v-if="description" class="text-gray-500">{{ description }}</span>
    </div>
    <Icon name="chevron-right" class="ml-auto" />
  </component>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { NuxtLink } from '#components';

defineProps<{
  icon?: string;
  title?: string;
  description?: string;
  to?: RouteLocationRaw;
  href?: string;
}>();
</script>
