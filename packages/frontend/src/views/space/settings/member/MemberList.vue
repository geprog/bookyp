<template>
  <SettingsHeader :title="t('members')" />

  <AppContent>
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

      <router-link v-else :to="{ name: 'settings-space-edit' }">
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
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const router = useRouter();
const { currentSpace, spaceId } = useCurrentSpace();

const { data: invitations, isLoading } = useFind(
  'invitations',
  computed(() => (spaceId.value === null ? null : { paginate: false, query: { spaceId: spaceId.value } })),
);

const editSpaceMember = async (spaceMemberId: string) => {
  if (spaceMemberId === user.value?._id) {
    return;
  }
  await router.push({ name: 'settings-space-member', params: { spaceMemberId } });
};

const currentPlan = computed(() => currentSpace.value?.plan || 'free');

const currentPlanIsActive = computed(
  () => currentSpace.value?.activeUntil && dayjs(currentSpace.value?.activeUntil).isAfter(dayjs()),
);

const spaceMembers = computed(() => currentSpace.value?.members || []);

const canAddNewUsers = computed(() => {
  if (currentPlan.value === 'free' && spaceMembers.value.length + invitations.value.length < 10) {
    return true;
  }

  if (currentPlan.value !== 'free' && currentPlanIsActive.value) {
    return true;
  }

  return false;
});
</script>
