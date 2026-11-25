<template>
  <AppContent class="flex-col">
    <Spinner v-if="loading" />
    <div v-else class="m-3">
      <AppButton v-if="canAddNewUsers" icon="add" data-test="button-invite-member" :to="`/space/${spaceId}/settings/member/invite`" class="w-full">
        {{ t('invite_new_member').toLocaleUpperCase() }}
      </AppButton>
      <AppButton v-else icon="info" :to="`/space/${spaceId}/settings/subscription`" class="w-full">
        {{ t('subscription.max_members_reached') }}
      </AppButton>
    </div>

    <template v-if="(invitations?.length ?? 0) > 0">
      <h2 class="m-3 font-bold">
        {{ t('invitation.pending_invitations') }}
      </h2>
      <ListItem
        v-for="invitation in invitations"
        :key="invitation._id"
        :description="invitationDescription(invitation)"
        :label="invitation.email"
        disabled
        class="relative m-3 italic"
        status-color="bg-gray-200"
        data-test="invitation-item"
        :to="`/space/${spaceId}/settings/member/invite/${invitation._id}`"
      />
    </template>

    <h2 class="m-3 font-bold">
      {{ t('invited_members') }}
    </h2>
    <ListItem
      v-for="member in members"
      :key="member.userId"
      :description="t(`roles.${member.role}.name`)"
      :label="t('member_name_and_email', { name: member.name, email: member.userId === user?._id ? t('its_you') : member.email })"
      class="relative m-3"
      :class="{ 'cursor-not-allowed font-bold': member.userId === user?._id }"
      data-test="member-item"
      :to="member.userId === user?._id ? undefined : `/space/${spaceId}/settings/member/${member.userId}`"
    />
  </AppContent>
</template>

<script setup lang="ts">
import type { Invitation } from '#shared/types/models';
import { isDomainInvitation } from '#shared/types/models';
import { planLimits } from '#shared/utils/plans';

const { t } = useI18n();
const { user } = useAuth();
const { space, spaceId } = useCurrentSpace();
const { activePlan } = useSubscriptionLimits(spaceId);

useAppHeader(() => ({ title: t('members'), back: `/space/${spaceId.value}/settings` }));

const { data: invitations, loading } = usePolling(() => `invitations:${spaceId.value}`, () => $fetch<Invitation[]>(`/api/spaces/${spaceId.value}/invitations`), { watch: [spaceId], default: () => [] });

const members = computed(() => (isFullSpace(space.value) ? space.value.members : []));

const canAddNewUsers = computed(() => members.value.length + (invitations.value?.length ?? 0) < planLimits.users[activePlan.value]);

function invitationDescription(invitation: Invitation): string {
  const parts = [t(`roles.${invitation.role}.name`)];
  if (isDomainInvitation(invitation)) {
    parts.push(`(${t('invitation.domain_invitation')})`);
  }
  return parts.join(' ');
}
</script>
