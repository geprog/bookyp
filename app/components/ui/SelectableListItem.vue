<template>
  <ListItem
    :label="label"
    :description="description"
    data-test="selectable-list-item"
    class="cursor-pointer"
    :class="{ 'bg-amber-200!': selected }"
    clickable
    @click="emit('update:selected', !selected)"
  >
    <template #start>
      <Icon :name="selected ? 'radio-checked' : 'radio-unchecked'" class="my-auto" :color="selected ? 'text-amber-500' : ''" />
    </template>
    <template #end>
      <slot name="end" />
    </template>
  </ListItem>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  description?: string;
  selected: boolean;
}>();

const emit = defineEmits<{ 'update:selected': [selected: boolean] }>();
</script>
