<template>
  <!-- rendered inside the app root like in v1, so the header (z-10) stays above the overlay -->
  <Teleport v-if="open" to="#__nuxt">
    <div class="fixed inset-0 flex content-center justify-center">
      <div class="absolute z-[1] size-full bg-gray-700 opacity-50" />
      <div class="z-[2] m-auto mx-4 flex max-w-xl grow flex-col rounded-lg border border-solid border-gray-200 bg-white p-5" role="dialog" aria-modal="true" data-test="dialog">
        <div class="mb-5 flex flex-row items-center justify-between">
          <span data-test="label" class="truncate text-2xl font-bold">{{ title }}</span>
          <IconButton icon="dismiss" :label="t('dialog.cancel')" @click.prevent="emit('close', false)" />
        </div>
        <span data-test="description" class="w-full text-sm text-gray-700">{{ description }}</span>
        <div class="flex flex-row justify-end gap-x-4 pt-4">
          <AppButton v-if="confirm !== false" :color="confirmColor" data-test="dialog-confirm" @click.prevent="emit('close', true)">
            {{ confirm || t('dialog.confirm') }}
          </AppButton>
          <AppButton v-if="cancel !== false" data-test="dialog-cancel" @click.prevent="emit('close', false)">
            {{ cancel || t('dialog.cancel') }}
          </AppButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/** the confirmation dialog of bookyp v1 (used through `useDialog`) */
withDefaults(defineProps<{
  title: string;
  description: string;
  confirm?: string | false;
  cancel?: string | false;
  confirmColor?: 'primary' | 'error';
}>(), {
  confirm: undefined,
  cancel: undefined,
  confirmColor: 'primary',
});

const emit = defineEmits<{ 'close': [result: boolean]; 'after:leave': [] }>();

// the overlay provider of Nuxt UI closes the dialog through this model and unmounts it after `after:leave`
const open = defineModel<boolean>('open', { default: true });
watch(open, (value) => {
  if (!value) {
    emit('after:leave');
  }
});

const { t } = useI18n();

onKeyStroke('Escape', (event) => {
  event.preventDefault();
  emit('close', false);
});
</script>
