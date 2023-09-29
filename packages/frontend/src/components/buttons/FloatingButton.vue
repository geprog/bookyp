<template>
  <button
    type="button"
    class="
      flex
      items-center
      justify-center
      rounded-full
      p-3
      h-8
      text-sm
      cursor-pointer
      focus:outline-transparent
      disabled:bg-gray-background disabled:cursor-not-allowed
    "
    :class="[selectedBackgroundColor, selectedForegroundColor, shadow]"
    :disabled="disabled"
  >
    <slot>
      <Icon v-if="icon" data-test="floating-button-icon" :name="icon" :color="selectedForegroundColor" />
      <p v-if="text" :class="[{ 'pl-2': icon }, selectedForegroundColor]">{{ text }}</p>
    </slot>
  </button>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue';

import Icon, { IconName } from '~/components/Icon.vue';

const props = withDefaults(
  defineProps<{
    icon?: IconName;
    disabled?: boolean;
    text?: string;
    stroke?: boolean;
    isSelected?: boolean;
    backGroundColor?: 'orange' | 'gray' | 'white' | 'red';
    foregroundColor?: 'orange' | 'black' | 'white' | 'red';
  }>(),
  {
    icon: undefined,
    text: undefined,
    backGroundColor: undefined,
    foregroundColor: undefined,
  },
);

const stroke = toRef(props, 'stroke');
const isSelected = toRef(props, 'isSelected');
const backGroundColor = toRef(props, 'backGroundColor');
const foregroundColor = toRef(props, 'foregroundColor');

const shadow = computed(() => (!stroke.value ? 'shadow-lg' : 'shadow-none'));
const selectedBackgroundColor = computed(() => {
  let color = 'bg-yellow-500 hover:bg-primary-dark';
  if (stroke.value) {
    color = 'bg-white';
    if (isSelected.value) {
      return `${color} border border-yellow-500`;
    }
    switch (foregroundColor.value) {
      case 'black':
        return `border border-gray-200`;
      case 'orange':
        return `border border-yellow-500`;
      case 'white':
        return `border border-white`;
      case 'red':
        return `${color} border border-red-600`;
      default:
        return `${color} border border-gray-400`;
    }
  }
  switch (backGroundColor.value) {
    case 'gray':
      color = 'bg-gray-200';
      break;
    case 'orange':
      color = 'bg-yellow-500';
      break;
    case 'white':
      color = 'bg-white';
      break;
    case 'red':
      color = 'bg-red-600';
  }
  return color;
});

const selectedForegroundColor = computed(() => {
  if (stroke.value) {
    if (isSelected.value) {
      return 'text-primary-normal';
    }
    return 'text-black';
  }

  if (foregroundColor.value) {
    switch (foregroundColor.value) {
      case 'orange':
        return 'text-primary-normal';
      case 'white':
        return 'text-white';
      case 'black':
        return 'text-gray-500';
      case 'red':
        return 'text-red-600';
      default:
        return foregroundColor.value;
    }
  }

  switch (backGroundColor.value) {
    case 'orange':
      return 'text-white';
    case 'gray':
      return 'text-gray-500';
    case 'white':
      return 'text-gray-900';
    default:
      return 'text-white';
  }
});
</script>
