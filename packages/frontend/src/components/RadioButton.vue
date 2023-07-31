<template>
  <div class="flex flex-col cursor-pointer" @click="emits('update-value')">
    <div class="flex flex-row gap-4">
      <Icon
        class="my-2 cursor-pointer"
        :name="value ? 'radio-checked' : 'radio-unchecked'"
        data-test="input-field-icon"
      />
      <div class="flex flex-row w-full py-2">
        <span>{{ name }}</span>
      </div>
    </div>
    <span v-if="hint" class="w-full text-gray-500 text-sm gap-4">{{ hint }}</span>
  </div>
</template>

<script lang="ts" setup>
import Icon from '~/components/Icon.vue';

defineProps<{
  name: string;
  value: boolean;
  hint?: string;
}>();

const emits = defineEmits<{
  (event: 'update-value'): void;
}>();
</script>
