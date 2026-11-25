<template>
  <AppContent>
    <SpaceForm v-model="form" create @save="save" />
  </AppContent>
  <div class="flex w-full justify-center">
    <div class="fixed bottom-5 mb-1 flex w-full max-w-5xl justify-center px-4">
      <FloatingButton type="submit" form="space" icon="i-bookyp-arrow-right" :text="t('space_create')" data-test="create-space-button" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Space } from '#shared/types/models';
import type { SpaceFormData } from '~/components/space/SpaceForm.vue';

const { t } = useI18n();
const { api, showError } = useApi();

useAppHeader(() => ({ menu: 'none', title: t('space_create'), back: '/spaces' }));

const form = ref<SpaceFormData>({
  name: '',
  isPublic: true,
  address: '',
  description: '',
  email: '',
  phone: '',
  website: '',
  coordinates: null,
});

async function save() {
  try {
    const space = await api<Space>('/api/spaces', { method: 'POST', body: { name: form.value.name, isPublic: form.value.isPublic } });
    await navigateTo(`/space/${space._id}/settings/space/edit`, { replace: true });
  }
  catch (error) {
    showError(error);
  }
}
</script>
