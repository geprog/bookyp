<template>
  <div class="fixed flex content-center justify-center left-0 top-0 right-0 bottom-0">
    <div class="absolute bg-gray-700 opacity-50 w-full z-1 h-full" />
    <div class="flex flex-col flex-grow border-solid border-1 bg-white max-w-xl m-auto mx-4 p-5 z-2 rounded-lg">
      <div class="flex flex-row justify-between items-center mb-5">
        <span data-test="label" class="text-base text-2xl font-bold truncate">{{ params.label }}</span>
        <IconButton icon="dismiss" @click.prevent="$emit('resolve', false)" />
      </div>
      <span data-test="description" class="w-full text-gray-700 text-sm">{{ params.description }}</span>
      <div class="flex flex-row gap-x-4 justify-end pt-4">
        <Button @click.prevent="$emit('resolve', true)">{{ params.confirm || t('dialog.confirm') }}</Button>
        <Button @click.prevent="$emit('resolve', false)">{{ params.cancel || t('dialog.cancel') }}</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onKeyStroke } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import type { DialogParams } from '~/compositions/useDialog';

defineProps<{
  params: DialogParams;
}>();

const emit = defineEmits<{
  (event: 'resolve', value: boolean): void;
}>();

const { t } = useI18n();

onKeyStroke('Escape', (e) => {
  e.preventDefault();
  emit('resolve', false);
});
</script>
