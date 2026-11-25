<template>
  <main class="flex w-full max-w-3xl grow flex-col px-2 md:mx-auto md:px-4" :class="{ 'mt-4': !noMargin }">
    <slot />
  </main>
</template>

<script setup lang="ts">
defineProps<{ noMargin?: boolean }>();
</script>
