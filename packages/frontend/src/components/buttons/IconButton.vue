<template>
  <button
    type="button"
    class="
      flex
      items-center
      justify-center
      p-1
      rounded-full
      focus:outline-transparent
      hover:text-primary-dark
      disabled:cursor-default disabled:text-gray-inactive disabled:hover:text-gray-inactive
    "
    :disabled="disabled"
  >
    <Icon data-test="button-icon" :name="icon" :color="iconColor" />
  </button>
</template>

<script lang="ts" setup>
import Icon, { IconName } from '~/components/Icon.vue';

defineProps<{
  icon: IconName;
  iconColor?: string;
  disabled?: boolean;
}>();
</script>
