<template>
  <input
    v-model="innerValue"
    class="w-full text-gray-900 placeholder-gray-600 focus:outline-none"
    type="text"
    :placeholder="placeholder"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    placeholder: '',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});
</script>
