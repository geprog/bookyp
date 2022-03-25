<template>
  <SettingsHeader :title="t('members')" />

  <div class="w-full max-w-2xl mx-auto">
    <div class="m-3">
      <Button
        :aria-label="t('add_new_member')"
        icon="add"
        class="mt-3 w-full"
        :text="t('add_new_member').toLocaleUpperCase()"
        @click="$router.push({ name: 'settings-space-member-create' })"
      />
    </div>

    <ListItem
      v-for="member in spaceMembers"
      :key="member.userId"
      :description="t(`roles.${member.role}.name`)"
      :label="member.name"
      class="cursor-pointer m-3 relative"
      :disabled="member.userId === user?._id"
      @click="editSpaceMember(member._id)"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'SpaceMemberList',
  components: { ListItem, SettingsHeader, Button },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const { spaceId } = useCurrentSpace();

    const { data: spaceMembers } = useFind(
      'spaceMembers',
      computed(() => (spaceId.value === null ? null : { paginate: false, query: { spaceId: spaceId.value } })),
    );

    const editSpaceMember = async (spaceMemberId: string) => {
      if (spaceMemberId === user.value?._id) {
        return;
      }
      await router.push({ name: 'settings-space-member', params: { spaceMemberId } });
    };

    return { t, spaceMembers, user, editSpaceMember };
  },
});
</script>
