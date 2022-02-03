<template>
  <Header :title="t('select_office')" has-back />

  <div class="w-full max-w-2xl mx-auto">
    <div class="m-3">
      <Button
        :aria-label="t('space_create')"
        icon="add"
        :text="t('space_create').toLocaleUpperCase()"
        class="mt-3 w-full"
        @click="createSpace"
      />
    </div>
    <ListItem
      v-for="space in spaces"
      :key="space._id"
      :label="space._id"
      :description="roleInSpace(space)"
      class="cursor-pointer m-3"
    />
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'SpaceList',
  components: {
    Button,
    ListItem,
    Header,
  },

  setup() {
    const { t } = useI18n();
    const feathers = useFeathers();

    const { data: spaces } = useFind(
      'spaces',
      computed(() => ({ paginate: false, query: { members: { $elemMatch: { userId: user.value?._id } } } })),
    );

    const createSpace = async () => {
      if (user.value) {
        const newSpace: Partial<Model.Space> = {
          members: [
            {
              role: 'admin',
              userId: user.value?._id,
            },
          ],

          floorPlan: [],
        };
        await feathers.service('spaces').create(newSpace);
      }
    };

    const roleInSpace = (space: Model.Space) => space.members.find((member) => member.userId === user.value?._id)?.role;

    return { t, spaces, roleInSpace, createSpace };
  },
});
</script>
