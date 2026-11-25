<template>
  <div class="flex h-8 w-24">
    <button
      type="button"
      class="flex w-12 flex-col items-center justify-center rounded-l-full p-2 hover:shadow-lg disabled:cursor-default disabled:text-gray-400 disabled:hover:bg-gray-200"
      :class="primaryLeft ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 hover:bg-gray-400'"
      :disabled="disabledLeft"
      @click.stop="emit('left')"
    >
      <UIcon :name="iconLeft" class="size-6 shrink-0" data-test="icon-start" />
    </button>
    <button
      type="button"
      class="flex w-12 flex-col items-center justify-center rounded-r-full bg-gray-200 p-2 hover:bg-gray-400 hover:shadow-lg disabled:cursor-default disabled:text-gray-400 disabled:hover:bg-gray-200"
      :disabled="disabledRight"
      @click.stop="emit('right')"
    >
      <UIcon :name="iconRight" class="size-6 shrink-0" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  iconLeft: string;
  iconRight: string;
  disabledLeft?: boolean;
  disabledRight?: boolean;
  primaryLeft?: boolean;
}>();

const emit = defineEmits<{ left: []; right: [] }>();
</script>
