<template>
  <Header :title="t('edit_space_information')" :back-fallback="{ name: 'settings-space-info' }" />
  <AppContent class="flex-col">
    <SpaceForm v-if="spaceToSave" v-model:space="spaceToSave" @save="saveSpace" />
  </AppContent>
  <SpaceEditActionButtons @save="saveSpace" @delete="deleteSpace" />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { cloneDeep } from 'lodash';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceEditActionButtons from '~/components/layout/toolbars/SpaceEditActionButtons.vue';
import SpaceForm from '~/components/space/SpaceForm.vue';
import { savedSpaceId, useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBack } from '~/compositions/useBack';
import { openDialog } from '~/compositions/useDialog';
import useFeathers from '~/compositions/useFeathers';

const { t } = useI18n();
const router = useRouter();
const feathers = useFeathers();
const { back } = useBack();

const { currentSpace: space } = useCurrentSpace();

const spaceToSave = ref<Model.Space>();
watch(
  space,
  (_space) => {
    spaceToSave.value = cloneDeep(_space);
  },
  { immediate: true },
);

async function saveSpace() {
  if (spaceToSave.value === undefined) {
    throw new Error('No space available');
  }

  await feathers.service('spaces').update(spaceToSave.value?._id, spaceToSave.value);
  void back({ name: 'settings-space-info' });
}

async function deleteSpace() {
  if (
    !(await openDialog({
      description: t('delete_dialog_description', { objectLabel: t('space') }),
      label: t('delete'),
      confirm: t('delete'),
    }))
  ) {
    return;
  }

  if (spaceToSave.value === undefined) {
    throw new Error('No space available');
  }

  await feathers.service('spaces').remove(spaceToSave.value._id);
  savedSpaceId.value = null;
  await router.push({ name: 'home' });
}
</script>
