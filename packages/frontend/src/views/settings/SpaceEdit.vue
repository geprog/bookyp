<template>
  <Header :title="t('space_information')" has-back>
    <template #start>
      <IconButton icon="dismiss" @click="$router.back()" />
    </template>
    <IconButton type="submit" form="space" icon="save" />
  </Header>
  <AppContent>
    <SpaceForm v-if="space" v-model:space="space" @save="saveSpace" @delete="deleteDialogVisible = true" />
    <Dialog
      data-test="delete-dialog"
      :description="t('delete_dialog_description', { objectLabel: t('space') })"
      :label="t('delete')"
      :confirm="t('delete')"
      :visible="deleteDialogVisible"
      @confirmation="deleteSpace"
    />
  </AppContent>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Dialog from '~/components/Dialog.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceForm from '~/components/space/SpaceForm.vue';
import { savedSpaceId, useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

const { t } = useI18n();
const router = useRouter();
const feathers = useFeathers();

const { currentSpace: space } = useCurrentSpace();

const saveSpace = async () => {
  if (space.value === undefined) {
    throw new Error('No space available');
  }

  await feathers.service('spaces').update(space.value?._id, space.value);
  router.back();
};

const deleteDialogVisible = ref(false);
const deleteSpace = async (confirmation: boolean) => {
  if (!confirmation) {
    deleteDialogVisible.value = false;
    return;
  }

  if (space.value === undefined) {
    throw new Error('No space available');
  }

  await feathers.service('spaces').remove(space.value._id);
  savedSpaceId.value = null;
  await router.push({ name: 'home' });
};
</script>
