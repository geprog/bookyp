<template>
  <div class="flex flex-row bg-white rounded-md shadow-md justify-between items-center">
    <div class="w-16 md:w-1/3 md:h-full">
      <img v-if="imageUrl" :src="imageUrl" class="w-16 h-16 md:w-full md:h-full rounded-l-md object-contain" />
      <img
        v-else
        src="/src/assets/img/space-placeholder.svg?url"
        class="w-16 h-16 md:w-full md:h-full rounded-l-md object-cover"
      />
    </div>
    <div class="flex flex-col p-2 justify-between w-2/3">
      <span class="truncate">{{ title }}</span>
      <span v-if="subtitle" class="truncate text-gray-500 text-sm h-5">{{ subtitle }}</span>
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
