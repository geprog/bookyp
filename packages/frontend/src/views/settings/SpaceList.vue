<template>
  <Header :title="t('select_office')" has-back />

  <div class="w-full max-w-2xl mx-auto">
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

import Header from '~/components/headers/Header.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'SpaceList',
  components: {
    Header,
    ListItem,
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();

    const { data: spaces } = useFind(
      'spaces',
      computed(() => ({ paginate: false, query: { members: { $elemMatch: { userId: user.value?._id } } } })),
    );

    const roleInSpace = (space: Model.Space) => space.members.find((member) => member.userId === user.value?._id)?.role;

    return { t, spaces, roleInSpace };
  },
});
</script>
