<template>
  <Header :title="t('space_information')" has-back>
    <template #start>
      <IconButton icon="dismiss" @click="$router.back()" />
    </template>
    <IconButton type="submit" form="space" icon="save" />
  </Header>
  <AppContent>
    <SpaceForm v-if="spaceToSave" v-model:space="spaceToSave" @save="saveSpace" />

    <div class="flex flex-col gap-y-6 mt-6 sm:max-w-xl <sm:max-w-xs mx-auto">
      <Button
        :aria-label="t('delete_space')"
        icon="delete"
        :text="t('delete_space').toLocaleUpperCase()"
        class="w-full"
        outlined
        @click="deleteDialogVisible = true"
      />
    </div>

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
import { Model } from '@bookyp/core';
import { cloneDeep } from 'lodash';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
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

const spaceToSave = ref<Model.Space>();
watch(
  space,
  (_space) => {
    spaceToSave.value = cloneDeep(_space);
  },
  { immediate: true },
);

const saveSpace = async () => {
  if (spaceToSave.value === undefined) {
    throw new Error('No space available');
  }

  await feathers.service('spaces').update(spaceToSave.value?._id, spaceToSave.value);
  router.back();
};

const deleteDialogVisible = ref(false);
const deleteSpace = async (confirmation: boolean) => {
  if (!confirmation) {
    deleteDialogVisible.value = false;
    return;
  }

  if (spaceToSave.value === undefined) {
    throw new Error('No space available');
  }

  await feathers.service('spaces').remove(spaceToSave.value._id);
  savedSpaceId.value = null;
  await router.push({ name: 'home' });
};
</script>
