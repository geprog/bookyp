<template>
  <!-- desktop: horizontal menu below the header -->
  <nav class="fixed z-10 mt-14 hidden h-12 w-full justify-center gap-4 bg-gray-200 text-gray-900 md:flex">
    <NuxtLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      class="flex items-center py-1.5"
      :class="{ 'text-amber-500': item.active }"
      :data-test="item.dataTest"
    >
      <div class="relative">
        <div v-if="item.spot" class="absolute top-0 right-0 block size-3 shrink-0 rounded-full bg-amber-600 z-10" />
        <Icon :name="item.icon" />
      </div>
      <span class="px-2 text-sm">{{ item.label }}</span>
    </NuxtLink>
  </nav>
  <div class="hidden h-12 w-full shrink-0 md:block" />
</template>

<script setup lang="ts">
import type { NavItem } from './navItems';

defineProps<{ items: NavItem[] }>();
</script>
