<template>
  <svg fill="none" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path v-for="(path, index) in paths" :key="index" :d="path" class="stroke-black" :class="pathClass" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  paths: string[];
  viewBox: string;
  pathClass?: string;
}>();
</script>
