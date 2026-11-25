<template>
  <form id="bookable" data-test="form" class="mx-auto w-full" @submit.prevent="emit('save')">
    <IconField icon="i-bookyp-edit">
      <TextField :model-value="modelValue.name" data-test="form-name" :placeholder="t('name')" required @update:model-value="update('name', $event)" />
    </IconField>
    <IconField icon="i-bookyp-document-one-page">
      <TextField :model-value="modelValue.description" :rows="5" data-test="form-description" :placeholder="t('description')" @update:model-value="update('description', $event)" />
    </IconField>
  </form>
</template>

<script setup lang="ts">
export interface BookableFormData {
  name: string;
  description: string;
}

const props = defineProps<{ modelValue: BookableFormData }>();
const emit = defineEmits<{ 'update:modelValue': [value: BookableFormData]; 'save': [] }>();

const { t } = useI18n();

function update<K extends keyof BookableFormData>(key: K, value: BookableFormData[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>
