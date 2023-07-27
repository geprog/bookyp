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
      cursor-pointer
      focus:outline-transparent
      disabled:bg-gray-background disabled:cursor-not-allowed
    "
    :class="[selectedBackgroundColor, selectedForegroundColor, shadow]"
    :disabled="disabled"
  >
    <slot>
      <Icon v-if="icon" data-test="floating-button-icon" :name="icon" />
      <p v-if="text" class="text-sm">{{ text }}</p>
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
    backGroundColor?: 'orange' | 'gray' | 'white';
    foregroundColor?: 'orange' | 'black' | 'white';
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
    if (isSelected.value) {
      return 'border border-yellow-500';
    }
    switch (backGroundColor.value) {
      case 'gray':
        return 'border border-gray-200';
      case 'orange':
        return 'border border-yellow-500';
      case 'white':
        return 'border border-white';
      default:
        return 'border border-gray-400 ';
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
  }
  return color;
});

const selectedForegroundColor = computed(() => {
  if (foregroundColor.value) {
    switch (foregroundColor.value) {
      case 'orange':
        return 'text-primary-normal';
      case 'white':
        return 'text-white';
      case 'black':
        return 'text-gray-500';
    }
    return foregroundColor.value;
  }
  if (stroke.value && isSelected.value) {
    return 'text-primary-normal';
  }
  if (stroke.value) {
    return 'text-black';
  }
  switch (backGroundColor.value) {
    case 'orange':
      return 'text-white';
    case 'gray':
      return 'text-gray-500';
    case 'white':
      return 'text-gray-900';
  }
  return 'text-white';
});
</script>
