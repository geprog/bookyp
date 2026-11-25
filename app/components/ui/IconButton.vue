<template>
  <button
    :type="type"
    :form="form"
    class="flex items-center justify-center rounded-full p-1 hover:text-amber-600 focus:outline-transparent disabled:cursor-default disabled:text-gray-400 disabled:hover:text-gray-400"
    :disabled="disabled"
    :aria-label="label"
  >
    <Icon data-test="button-icon" :name="icon" :color="iconColor" />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string;
  iconColor?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  form?: string;
  label?: string;
}>(), {
  iconColor: '',
  type: 'button',
  form: undefined,
  label: undefined,
});
</script>
