<template>
  <AppContent class="flex-col">
    <form id="spaceMemberInviteForm" data-test="form" class="flex flex-col gap-4 px-4 max-md:py-12" @submit.prevent="invite">
      <IconField icon="i-bookyp-email">
        <TextField v-model="email" data-test="form-email" :placeholder="t('email_address')" required />
      </IconField>

      <AppButton type="submit" icon="send" data-test="submit-invitation" class="w-full">
        {{ t('invitation.send').toLocaleUpperCase() }}
      </AppButton>

      <SelectableListItem :selected="role === 'user'" :label="t('roles.user.name')" :description="t('roles.user.description')" data-test="role-user" @update:selected="role = 'user'" />
      <SelectableListItem :selected="role === 'admin'" :label="t('roles.admin.name')" :description="t('roles.admin.description')" data-test="role-admin" @update:selected="role = 'admin'" />
    </form>
  </AppContent>
</template>

<script setup lang="ts">
import type { MemberRole } from '#shared/types/models';

const { t } = useI18n();
const { spaceId } = useCurrentSpace();
const { api, showError, translateError } = useApi();
const { back } = useBack();
const toast = useAppToast();

useAppHeader(() => ({ menu: 'none', title: t('invite_new_member'), back: `/space/${spaceId.value}/settings/member` }));

const email = ref('');
const role = ref<MemberRole>('user');

async function invite() {
  try {
    await api(`/api/spaces/${spaceId.value}/invitations`, { method: 'POST', body: { email: email.value, role: role.value } });
    await back(`/space/${spaceId.value}/settings/member`);
  }
  catch (error) {
    const code = getApiErrorCode(error);
    if (code === 'already_in_space' || code === 'already_invited' || code === 'members_limit_reached' || code === 'invitations_limit_reached') {
      toast.error(translateError(error));
    }
    else {
      showError(error);
    }
  }
}
</script>
