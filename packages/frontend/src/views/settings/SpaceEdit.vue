<template>
  <Header :title="t('space_information')" has-back>
    <IconButton type="submit" form="space" icon="save" />
  </Header>
  <SpaceForm v-if="space" v-model:space="space" @save="saveSpace" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import SpaceForm from '~/components/space/SpaceForm.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'SpaceEdit',

  components: { Header, IconButton, SpaceForm },

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

    return { saveSpace, space, t };
  },
});
</script>
