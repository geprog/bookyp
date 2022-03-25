<template>
  <Header :title="t('select_office')" has-back />

  <div class="w-full max-w-2xl mx-auto">
    <div class="m-3">
      <Button
        :aria-label="t('space_create')"
        icon="add"
        :text="t('space_create').toLocaleUpperCase()"
        class="mt-3 w-full"
        @click="$router.push({ name: 'space-create' })"
      />
    </div>
    <SelectableListItem
      v-for="space in spaces"
      :key="space._id"
      :selected="currentSpace?._id === space._id"
      :label="space.name"
      :description="roleInSpace(space)"
      class="m-3"
      data-test="space-item"
      @click="changeSpace(space._id)"
    />
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'SpaceList',
  components: {
    Button,
    SelectableListItem,
    Header,
  },

  setup() {
    const { t } = useI18n();
    const router = useRouter();

    const { currentSpace, setSpaceId } = useCurrentSpace();

    const { data: spaces } = useFind(
      'spaces',
      computed(() => ({ paginate: false, query: { members: { $elemMatch: { userId: user.value?._id } } } })),
    );

    const roleInSpace = (space: Model.Space) => space.members.find((member) => member.userId === user.value?._id)?.role;

    const changeSpace = async (spaceId: string) => {
      if (currentSpace.value?._id === spaceId) {
        return;
      }
      setSpaceId(spaceId);
      await router.push({ name: 'home' });
    };

    return { t, spaces, roleInSpace, changeSpace, currentSpace };
  },
});
</script>
