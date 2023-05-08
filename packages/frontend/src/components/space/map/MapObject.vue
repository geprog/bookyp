<template>
  <svg fill="none" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path v-for="path in paths" :key="path" :d="path" class="stroke-black" :class="pathStyle" />
    </g>
  </svg>
</template>

<script lang="ts" setup>
defineProps<{
  paths: string[];
  viewBox: string;
  pathStyle?: string;
}>();
</script>
