<template>
  <div class="flex gap-4">
    <UIcon :name="icon" class="my-2 size-6 shrink-0" data-test="input-field-icon" />
    <div class="flex w-full flex-col py-2" :class="{ 'border-b border-gray-500': !readonly }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  readonly?: boolean;
}>();
</script>
