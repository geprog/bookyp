<template>
  <SettingsHeader :title="t('members')" />

  <AppContent class="flex-col">
    <ProgressIndicator v-if="isLoading" />
    <div v-else class="m-3">
      <Button
        v-if="canAddNewUsers"
        :aria-label="t('invite_new_member')"
        icon="add"
        class="w-full"
        :text="t('invite_new_member').toLocaleUpperCase()"
        data-test="button-invite-member"
        @click="$router.push({ name: 'settings-space-member-invite' })"
      />

      <router-link v-else :to="{ name: 'space-settings-subscription' }">
        <Button icon="info" class="w-full" :text="t('subscription.max_members_reached')" />
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
    </template>

    <h2 class="m-3 font-bold">
      {{ t('invited_members') }}
    </h2>

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
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';
import { useSubscription } from '~/compositions/useSubscription';

const { t } = useI18n();
const router = useRouter();
const { spaceId, currentSpace } = useCurrentSpace();
const { canAddNewUsers } = useSubscription();

const editSpaceMember = async (spaceMemberId: string) => {
  if (spaceMemberId === user.value?._id) {
    return;
  }
  await router.push({ name: 'settings-space-member', params: { spaceMemberId } });
};

const { data: invitations, isLoading } = useFind(
  'invitations',
  computed(() => (spaceId.value === null ? null : { paginate: false, query: { spaceId: spaceId.value } })),
);

const spaceMembers = computed(() => currentSpace.value?.members || []);
</script>
