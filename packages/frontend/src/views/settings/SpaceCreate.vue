<template>
  <Header :title="t('space_create')" :back-fallback="{ name: 'spaces-list' }">
    <IconButton type="submit" form="space" icon="save" />
  </Header>
  <AppContent>
    <SpaceForm v-if="space" v-model:space="space" @save="saveSpace" />
  </AppContent>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceForm from '~/components/space/SpaceForm.vue';
import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'SpaceCreate',

  components: { Header, IconButton, SpaceForm, AppContent },

  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();

    const space = ref<Partial<Model.Space>>({
      description: '',
      address: '',
      name: '',
    });

    const saveSpace = async () => {
      if (user.value === undefined) {
        throw new Error('No user available to create a space for');
      }

      const _space = await feathers.service('spaces').create({
        members: [
          {
            role: 'admin',
            userId: user.value._id,
          },
        ],
        ...space.value,
      });
      await router.push({
        name: 'space',
        params: { spaceId: _space._id },
      });
    };

    return { saveSpace, space, t };
  },
});
</script>
