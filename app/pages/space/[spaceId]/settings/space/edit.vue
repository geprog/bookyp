<template>
  <AppContent class="flex-col">
    <SpaceForm v-if="form" v-model="form" v-model:image="image" :space-id="spaceId" :image-url="space.imageUrl" @save="save" />
  </AppContent>
  <div class="flex w-full justify-center">
    <div class="fixed bottom-5 mb-1 flex w-full max-w-5xl justify-between px-4">
      <FloatingButton icon="i-bookyp-delete" :text="t('delete_space')" foreground-color="red" background-color="white" data-test="delete-space-button" @click="deleteSpace" />
      <FloatingButton type="submit" form="space" icon="i-bookyp-check-mark" :text="t('save_space')" data-test="save-space-button" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SpaceFormData } from '~/components/space/SpaceForm.vue';

const { t } = useI18n();
const { space, spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { openDialog } = useDialog();
const { savedSpaceId } = useSavedSpace();

useAppHeader(() => ({ menu: 'none', title: t('edit_space_information'), back: `/space/${spaceId.value}/settings/info` }));

const form = ref<SpaceFormData>();
/** a new image (`null` removes it), stored together with the form like in v1 */
const image = ref<File | null>();
watch(space, (value) => {
  if (value && !form.value) {
    form.value = {
      name: value.name,
      isPublic: isFullSpace(value) ? value.isPublic !== false : true,
      address: value.address ?? '',
      description: value.description ?? '',
      email: (isFullSpace(value) && value.email) || '',
      phone: value.phone ?? '',
      website: value.website ?? '',
      coordinates: value.coordinates ?? null,
    };
  }
}, { immediate: true });

async function save() {
  if (!form.value) {
    return;
  }
  try {
    if (image.value) {
      const body = new FormData();
      body.append('file', image.value);
      await api(`/api/spaces/${spaceId.value}/image`, { method: 'POST', body });
    }
    else if (image.value === null) {
      await api(`/api/spaces/${spaceId.value}/image`, { method: 'DELETE' });
    }
    image.value = undefined;
    await api(`/api/spaces/${spaceId.value}`, { method: 'PATCH', body: form.value });
    // the space pages show the saved data (and image) right away instead of after the next poll
    await refreshNuxtData(`space:${spaceId.value}`);
    await navigateTo(`/space/${spaceId.value}/settings/info`, { replace: true });
  }
  catch (error) {
    showError(error);
  }
}

async function deleteSpace() {
  if (!(await openDialog({ title: t('delete'), description: t('delete_dialog_description', { objectLabel: t('space') }), confirm: t('delete'), confirmColor: 'error' }))) {
    return;
  }
  try {
    await api(`/api/spaces/${spaceId.value}`, { method: 'DELETE' });
    savedSpaceId.value = null;
    await navigateTo('/spaces');
  }
  catch (error) {
    showError(error);
  }
}
</script>
