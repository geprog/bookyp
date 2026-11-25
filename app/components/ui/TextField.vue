<template>
  <p v-if="readonly" class="min-h-6 w-full">
    <span v-if="modelValue" class="whitespace-pre-line text-gray-900">{{ modelValue }}</span>
    <span v-else class="text-gray-600">{{ placeholder }}</span>
  </p>
  <textarea
    v-else-if="rows && rows > 1"
    :value="modelValue"
    class="min-h-6 w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
    :placeholder="placeholder"
    :required="required"
    :data-test="dataTest"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
  <input
    v-else
    :value="modelValue"
    class="min-h-6 w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
    :type="type"
    :placeholder="placeholder"
    :required="required"
    :data-test="dataTest"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string;
  readonly?: boolean;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  type?: 'text' | 'email' | 'url' | 'tel';
  dataTest?: string;
}>(), {
  modelValue: '',
  placeholder: '',
  rows: undefined,
  type: 'text',
  dataTest: undefined,
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>
