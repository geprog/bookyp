<template>
  <path v-for="(path, index) in floorPlan" :key="`${index}-${path}`" :d="path" class="stroke-black" stroke-width="2" />
</template>

<script setup lang="ts">
const props = defineProps<{ floorPlan: string[] }>();

useAndRegisterViewBox('FloorPlan', toRef(props, 'floorPlan'), { strokeWidth: 2 });
</script>
