<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton icon="delete" icon-color="text-red-600 hover:text-red-200" :label="t('delete')" data-test="delete-button" @click="remove" />
    <IconButton type="submit" form="spaceMemberForm" icon="save" :label="t('save')" data-test="submit-member" />
  </Teleport>
  <AppContent>
    <form v-if="member" id="spaceMemberForm" data-test="form" class="mx-4" @submit.prevent="save">
      <IconField icon="i-bookyp-email" readonly>
        <span>{{ member.email }}</span>
      </IconField>
      <SelectableListItem :selected="role === 'user'" :label="t('roles.user.name')" :description="t('roles.user.description')" class="my-3" @update:selected="role = 'user'" />
      <SelectableListItem :selected="role === 'admin'" :label="t('roles.admin.name')" :description="t('roles.admin.description')" class="my-3" @update:selected="role = 'admin'" />
    </form>
  </AppContent>
</template>

<script setup lang="ts">
import type { MemberRole } from '#shared/types/models';

const { t } = useI18n();
const route = useRoute();
const { space, spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { back } = useBack();

useAppHeader(() => ({ menu: 'none', title: t('edit_member'), back: `/space/${spaceId.value}/settings/member` }));

const memberId = computed(() => route.params.spaceMemberId as string);
const member = computed(() => (isFullSpace(space.value) ? space.value.members.find(m => m.userId === memberId.value) : undefined));

const role = ref<MemberRole>('user');
watch(member, (value) => {
  if (value) {
    role.value = value.role;
  }
}, { immediate: true });

async function save() {
  try {
    await api(`/api/spaces/${spaceId.value}/members/${memberId.value}`, { method: 'PUT', body: { role: role.value } });
    await back(`/space/${spaceId.value}/settings/member`);
  }
  catch (error) {
    showError(error);
  }
}

async function remove() {
  try {
    await api(`/api/spaces/${spaceId.value}/members/${memberId.value}`, { method: 'DELETE' });
    await back(`/space/${spaceId.value}/settings/member`);
  }
  catch (error) {
    showError(error);
  }
}
</script>
