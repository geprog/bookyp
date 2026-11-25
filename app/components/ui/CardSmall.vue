<template>
  <div class="flex flex-row items-center justify-start rounded-md bg-white shadow-md">
    <div class="w-16 md:h-full md:w-1/3">
      <img v-if="imageUrl" :src="imageUrl" class="size-16 rounded-l-md object-contain md:size-full" alt="">
      <img v-else src="~/assets/img/space-placeholder.svg" class="size-16 rounded-l-md object-cover md:size-full" alt="">
    </div>
    <div class="flex w-2/3 flex-col justify-between p-2">
      <span class="truncate">{{ title }}</span>
      <span v-if="subtitle" class="h-5 truncate text-sm text-gray-500">{{ subtitle }}</span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  imageUrl?: string;
  title: string;
  subtitle?: string;
}>();
</script>
