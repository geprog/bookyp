<template>
  <p v-if="readonly" class="w-full min-h-6">
    <span v-if="innerValue" class="text-gray-900 whitespace-pre-line">{{ innerValue }}</span>
    <span v-else class="text-gray-600">{{ placeholder }}</span>
  </p>
  <textarea
    v-else-if="rows && rows > 1"
    v-model="innerValue"
    class="w-full min-h-6 text-gray-900 placeholder-gray-600 focus:outline-none"
    :placeholder="placeholder"
  />
  <input
    v-else
    v-model="innerValue"
    class="w-full min-h-6 text-gray-900 placeholder-gray-600 focus:outline-none"
    type="text"
    :placeholder="placeholder"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    readonly?: boolean;
    placeholder?: string;
    rows?: number;
  }>(),
  {
    modelValue: '',
    placeholder: '',
    rows: undefined,
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
