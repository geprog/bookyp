<template>
  <button
    type="button"
    class="
      flex
      items-center
      justify-center
      rounded-full
      p-3
      cursor-pointer
      hover:bg-primary-dark
      focus:outline-transparent
      disabled:bg-gray-background disabled:cursor-not-allowed
      bg-primary-normal
      shadow-lg
    "
    :disabled="disabled"
  >
    <slot>
      <Icon v-if="icon" data-test="floating-button-icon" :name="icon" color="text-white" />
    </slot>
  </button>
</template>

<script lang="ts" setup>
import Icon, { IconName } from '~/components/Icon.vue';

defineProps<{
  icon?: IconName;
  disabled?: boolean;
}>();
</script>
