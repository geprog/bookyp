<template>
  <Header :title="t('space_information')" has-back>
    <IconButton type="submit" form="space" icon="save" />
  </Header>
  <AppContent>
    <SpaceForm v-if="space" v-model:space="space" @save="saveSpace" @delete="deleteDialogVisible = true" />
    <DeleteDialog
      data-test="delete-dialog"
      :object-label="t('space')"
      :visible="deleteDialogVisible"
      @confirmation="deleteSpace"
    />
  </AppContent>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import DeleteDialog from '~/components/DeleteDialog.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceForm from '~/components/space/SpaceForm.vue';
import { spaceId, useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'SpaceEdit',

  components: { Header, IconButton, SpaceForm, AppContent, DeleteDialog },

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();

    const { currentSpace: space } = useCurrentSpace();

    const saveSpace = async () => {
      if (space.value === undefined) {
        throw new Error('No space available');
      }

      await feathers.service('spaces').update(space.value?._id, space.value);
      await router.push({ name: 'home' });
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
      spaceId.value = null;
      await router.push({ name: 'home' });
    };

    return { saveSpace, space, t, deleteSpace, deleteDialogVisible };
  },
});
</script>
