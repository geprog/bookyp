<template>
  <SettingsHeader :title="t('members')" />

  <div class="w-full max-w-2xl mx-auto">
    <div class="m-3">
      <Button
        v-if="spaceMembers.length < 10"
        :aria-label="t('invite_new_member')"
        icon="add"
        class="mt-3 w-full"
        :text="t('invite_new_member').toLocaleUpperCase()"
        data-test="button-invite-member"
        @click="$router.push({ name: 'settings-space-member-invite' })"
      />

      <router-link v-else :to="{ name: 'settings-space-edit' }" class="flex">
        <Button icon="info" :text="t('plan.max_members_reached')" />
      </router-link>
    </div>

    <template v-if="invitations.length > 0">
      <h2 class="m-3 font-bold">
        {{ t('invitation.pending_invitations') }}
      </h2>
      <ListItem
        v-for="invitation in invitations"
        :key="invitation._id"
        :description="t(`roles.${invitation.role}.name`)"
        :label="invitation.email"
        disabled
        class="cursor-pointer m-3 relative italic"
        status-color="bg-gray-background"
        data-test="invitation-item"
        @click="$router.push({ name: 'settings-space-member-invitation', params: { invitationId: invitation._id } })"
      />

      <h2 class="m-3 font-bold">
        {{ t('members') }}
      </h2>
    </template>

    <ListItem
      v-for="member in spaceMembers"
      :key="member.userId"
      :description="t(`roles.${member.role}.name`)"
      :label="
        t('member_name_and_email', {
          name: member.name,
          email: member.userId === user?._id ? t('its_you') : member.email,
        })
      "
      class="cursor-pointer m-3 relative"
      :class="{ 'cursor-not-allowed font-bold': member.userId === user?._id }"
      @click="editSpaceMember(member.userId)"
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
    const { currentSpace, spaceId } = useCurrentSpace();

    const { data: invitations } = useFind(
      'invitations',
      computed(() => (spaceId.value === null ? null : { paginate: false, query: { spaceId: spaceId.value } })),
    );

    const editSpaceMember = async (spaceMemberId: string) => {
      if (spaceMemberId === user.value?._id) {
        return;
      }
      await router.push({ name: 'settings-space-member', params: { spaceMemberId } });
    };

    const spaceMembers = computed(() => currentSpace.value?.members || []);

    return { t, spaceMembers, invitations, user, editSpaceMember };
  },
});
</script>
