<template>
  <button
    :type="type"
    :form="form"
    class="pointer-events-auto flex h-8 cursor-pointer items-center justify-center rounded-full p-3 text-sm focus:outline-transparent disabled:cursor-not-allowed disabled:bg-gray-200"
    :class="[background, foreground, stroke ? 'shadow-none' : 'shadow-lg']"
    :disabled="disabled"
  >
    <slot>
      <UIcon v-if="icon" :name="icon" class="size-6 shrink-0" data-test="floating-button-icon" />
      <span v-if="text" :class="{ 'pl-2': icon }">{{ text }}</span>
    </slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: string;
  text?: string;
  disabled?: boolean;
  /** outlined style */
  stroke?: boolean;
  isSelected?: boolean;
  backgroundColor?: 'orange' | 'gray' | 'white' | 'red';
  foregroundColor?: 'orange' | 'black' | 'white' | 'red';
  type?: 'button' | 'submit';
  form?: string;
}>(), {
  icon: undefined,
  text: undefined,
  backgroundColor: 'orange',
  foregroundColor: undefined,
  type: 'button',
  form: undefined,
});

const background = computed(() => {
  if (props.stroke) {
    if (props.isSelected) {
      return 'bg-white border border-amber-500';
    }
    switch (props.foregroundColor) {
      case 'black':
        return 'bg-white border border-gray-200';
      case 'orange':
        return 'bg-white border border-amber-500';
      case 'red':
        return 'bg-white border border-red-600';
      default:
        return 'bg-white border border-gray-400';
    }
  }
  switch (props.backgroundColor) {
    case 'gray':
      return 'bg-gray-200';
    case 'white':
      return 'bg-white';
    case 'red':
      return 'bg-red-600';
    default:
      return 'bg-amber-500 hover:bg-amber-600';
  }
});

const foreground = computed(() => {
  if (props.stroke) {
    return props.isSelected ? 'text-primary' : 'text-black';
  }
  switch (props.foregroundColor) {
    case 'orange':
      return 'text-primary';
    case 'white':
      return 'text-white';
    case 'black':
      return 'text-gray-500';
    case 'red':
      return 'text-red-600';
  }
  switch (props.backgroundColor) {
    case 'gray':
      return 'text-gray-500';
    case 'white':
      return 'text-gray-900';
    default:
      return 'text-white';
  }
});
</script>
