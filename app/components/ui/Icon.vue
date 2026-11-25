<template>
  <UIcon :name="`i-bookyp-${name}`" class="icon block shrink-0" :class="[color, small ? 'size-4' : 'size-6']" data-test="icon-component" />
</template>

<script setup lang="ts">
/** an icon of the bookyp icon set (24px, 16px icons are rendered at 16px like in v1) */
const props = defineProps<{
  name: string;
  color?: string;
}>();

const sixteen = new Set(['bold', 'code', 'credit-card', 'format-link', 'image', 'italic', 'ordered-list', 'quote', 'task-list', 'unordered-list']);
const small = computed(() => sixteen.has(props.name));
</script>
