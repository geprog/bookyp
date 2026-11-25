<template>
  <IconField :icon="icon" class="w-full" :readonly="readonly">
    <TextField
      :model-value="modelValue"
      :data-test="dataTest"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
      :readonly="readonly"
      :type="type"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </IconField>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string;
  modelValue?: string;
  placeholder?: string;
  rows?: number;
  dataTest?: string;
  required?: boolean;
  readonly?: boolean;
  type?: 'text' | 'email' | 'url' | 'tel';
}>(), {
  modelValue: '',
  placeholder: '',
  rows: undefined,
  dataTest: undefined,
  type: 'text',
});

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>
