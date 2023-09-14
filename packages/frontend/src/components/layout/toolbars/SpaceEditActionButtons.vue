<template>
  <div class="flex w-full justify-center">
    <div
      class="bottom-5 fixed w-full flex mb-1 px-4 max-w-5xl"
      :class="[{ 'justify-center': create }, { 'justify-between': !create }]"
    >
      <FloatingButton
        v-if="!create"
        icon="delete"
        :text="t('delete_space')"
        foreground-color="red"
        back-ground-color="white"
        @click="emits('delete')"
      />
      <FloatingButton
        type="submit"
        form="space"
        :icon="create ? 'arrow-right' : 'check-mark'"
        :text="create ? t('space_create') : t('save_space')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';

const props = defineProps<{
  create?: boolean;
}>();

const emits = defineEmits<{
  (event: 'delete'): void;
}>();

const create = toRef(props, 'create');

const { t } = useI18n();
</script>
