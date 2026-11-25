<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton icon="delete" icon-color="text-red-600 hover:text-red-200" :label="t('delete')" data-test="delete-button" @click="remove" />
    <IconButton type="submit" form="spaceMemberInvitationForm" icon="save" :label="t('save')" data-test="submit-invitation" />
  </Teleport>
  <AppContent>
    <form v-if="invitation" id="spaceMemberInvitationForm" data-test="form" class="mx-4" @submit.prevent="save">
      <IconField icon="i-bookyp-email" readonly>
        <span>{{ invitation.email }}</span>
      </IconField>
      <SelectableListItem :selected="role === 'user'" :label="t('roles.user.name')" :description="t('roles.user.description')" class="my-3" @update:selected="role = 'user'" />
      <SelectableListItem :selected="role === 'admin'" :label="t('roles.admin.name')" :description="t('roles.admin.description')" class="my-3" @update:selected="role = 'admin'" />
    </form>
    <Spinner v-else />
  </AppContent>
</template>

<script setup lang="ts">
import type { Invitation, MemberRole } from '#shared/types/models';

const { t } = useI18n();
const route = useRoute();
const { spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { back } = useBack();

useAppHeader(() => ({ menu: 'none', title: t('invitation.edit'), back: `/space/${spaceId.value}/settings/member` }));

const invitationId = computed(() => route.params.invitationId as string);
const { data: invitation } = useApiData(() => `invitation:${invitationId.value}`, () => $fetch<Invitation>(`/api/invitations/${invitationId.value}`), { watch: [invitationId] });

const role = ref<MemberRole>('user');
watch(invitation, (value) => {
  if (value) {
    role.value = value.role;
  }
}, { immediate: true });

async function save() {
  try {
    await api(`/api/invitations/${invitationId.value}`, { method: 'PATCH', body: { role: role.value } });
    await back(`/space/${spaceId.value}/settings/member`);
  }
  catch (error) {
    showError(error);
  }
}

async function remove() {
  try {
    await api(`/api/invitations/${invitationId.value}`, { method: 'DELETE' });
    await back(`/space/${spaceId.value}/settings/member`);
  }
  catch (error) {
    showError(error);
  }
}
</script>
