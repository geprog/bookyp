<template>
  <div class="flex h-8 w-24 cursor-pointer">
    <button
      type="button"
      class="flex w-12 flex-col items-center justify-center rounded-l-full p-2 shadow-lg"
      :class="selected === 'start' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-400'"
      data-test="button-start"
      @click="emit('select', 'start')"
    >
      <UIcon :name="startIcon" class="size-6 shrink-0" data-test="icon-start" />
    </button>
    <button
      type="button"
      class="flex w-12 flex-col items-center justify-center rounded-r-full p-2 shadow-lg"
      :class="selected === 'end' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-400'"
      data-test="button-end"
      @click="emit('select', 'end')"
    >
      <UIcon :name="endIcon" class="size-6 shrink-0" data-test="icon-end" />
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  selected?: 'start' | 'end';
  startIcon: string;
  endIcon: string;
}>(), {
  selected: 'start',
});

const emit = defineEmits<{ select: [selected: 'start' | 'end'] }>();
</script>
