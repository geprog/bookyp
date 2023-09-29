<template>
  <div class="flex w-full justify-center">
    <div class="fixed bottom-18 w-full flex px-4 mb-1 justify-between md:bottom-5 max-w-5xl">
      <FloatingButton
        icon="dismiss"
        :text="t('reject_request')"
        foreground-color="red"
        back-ground-color="white"
        @click="emits('reject')"
      />
      <FloatingButton icon="check-mark" :text="t('accept_request')" @click="emits('accept')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';

const emits = defineEmits<{
  (event: 'reject'): void;
  (event: 'accept'): void;
}>();

const { t } = useI18n();
</script>
