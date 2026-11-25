<template>
  <!-- mobile: tab bar at the bottom -->
  <footer class="fixed bottom-0 z-10 flex h-14 w-full justify-around gap-4 border-t border-gray-200 bg-white text-gray-900 shadow-[0px_5px_15px_var(--color-gray-400)] md:hidden">
    <NuxtLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      class="flex grow flex-col items-center px-4 py-1.5"
      :class="{ 'text-amber-500': item.active }"
      :data-test="item.dataTest"
    >
      <div class="relative">
        <div v-if="item.spot" class="absolute top-0 right-[-10px] block size-3 shrink-0 rounded-full bg-amber-600" />
        <Icon :name="item.icon" />
      </div>
      <span class="text-sm">{{ item.label }}</span>
    </NuxtLink>
  </footer>
  <div class="h-14 w-full shrink-0 md:hidden" />
</template>

<script setup lang="ts">
import type { NavItem } from './navItems';

defineProps<{ items: NavItem[] }>();
</script>
