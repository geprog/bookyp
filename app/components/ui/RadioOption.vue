<template>
  <label class="flex cursor-pointer flex-col" @click="emit('select')">
    <div class="flex flex-row gap-2">
      <Icon :name="selected ? 'radio-checked' : 'radio-unchecked'" class="my-2" data-test="input-field-icon" />
      <div class="flex w-full flex-row py-2">
        <span>{{ name }}</span>
      </div>
    </div>
    <span v-if="hint" class="w-full text-sm text-gray-500">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  selected: boolean;
  hint?: string;
}>();

const emit = defineEmits<{ select: [] }>();
</script>
