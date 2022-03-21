<template>
  <Header :title="t('settings')" has-back>
    <template #second>
      <SettingsTabs />
    </template>
  </Header>

  <div class="w-full max-w-2xl mx-auto">
    <div class="m-3">
      <Button
        :aria-label="t('add_new_member')"
        icon="add"
        class="mt-3 w-full"
        :text="t('add_new_member').toLocaleUpperCase()"
        @click="$router.replace({ name: 'settings-space-member-create' })"
      />
    </div>

    <ListItem
      v-for="member in spaceMembers"
      :key="member.userId"
      :description="member.role"
      :label="member.name"
      class="cursor-pointer m-3 relative"
    >
      <template #end>
        <IconButton
          v-show="member.userId !== user?._id"
          icon="delete"
          icon-color="text-red-text hover:text-red-background"
          data-test="icon"
          @click="removeSpaceMember(member)"
        />
      </template>
    </ListItem>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import SettingsTabs from '~/components/tabs/SettingsTabs.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'SpaceMemberList',
  components: { ListItem, SettingsTabs, Header, Button, IconButton },
  setup() {
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();
    const { spaceId } = useCurrentSpace();

    const { data: spaceMembers } = useFind(
      'spaceMembers',
      computed(() => (spaceId.value === null ? null : { paginate: false, query: { spaceId: spaceId.value } })),
    );

    async function removeSpaceMember(member: Model.SpaceMember): Promise<void> {
      await feathers.service('spaceMembers').remove(member.userId, { query: { spaceId: spaceId.value } });
      await router.push({ name: 'settings-space-members', params: { spaceId: spaceId.value } });
    }

    return { t, spaceMembers, removeSpaceMember, user };
  },
});
</script>
