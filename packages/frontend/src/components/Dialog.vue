<template>
  <div v-if="visible" class="absolute flex content-center justify-center left-0 top-0 right-0 bottom-0">
    <div class="absolute bg-gray-700 opacity-50 w-full h-full z-1" />
    <div class="flex flex-col flex-grow border-solid border-1 bg-white max-w-xl m-auto mx-4 p-5 z-2 rounded-lg">
      <div class="flex flex-row justify-between items-center mb-5">
        <span data-test="label" class="text-base text-2xl font-bold truncate">{{ label }}</span>
        <IconButton icon="dismiss" @click.prevent="$emit('confirmation', false)" />
      </div>
      <span data-test="description" class="w-full text-gray-700 text-sm">{{ description }}</span>
      <div class="flex flex-row gap-x-4 justify-end pt-4">
        <Button @click.prevent="$emit('confirmation', true)">{{ confirm || t('dialog.confirm') }}</Button>
        <Button @click.prevent="$emit('confirmation', false)">{{ cancel || t('dialog.cancel') }}</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onKeyStroke } from '@vueuse/core';
import { toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';

import IconButton from './buttons/IconButton.vue';

const props = defineProps<{
  visible: boolean;
  label: string;
  description: string;
  confirm?: string;
  cancel?: string;
}>();

const emit = defineEmits<{
  (e: 'confirmation', value: boolean): void;
}>();

const { t } = useI18n();
const visible = toRef(props, 'visible');

onKeyStroke('Escape', (e) => {
  e.preventDefault();
  if (visible.value) {
    emit('confirmation', false);
  }
});
</script>
