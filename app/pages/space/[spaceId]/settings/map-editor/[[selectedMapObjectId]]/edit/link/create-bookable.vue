<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton type="submit" form="bookable" icon="check-mark" :label="t('save')" data-test="submit-bookable" />
  </Teleport>
  <AppContent>
    <BookableForm v-model="form" data-test="bookable-form" @save="save" />
  </AppContent>
</template>

<script setup lang="ts">
import type { Bookable } from '#shared/types/models';
import type { BookableFormData } from '~/components/space/BookableForm.vue';

/** create a bookable and link the selected map object to it (v1 route `edit/link/create-bookable`) */
const { t } = useI18n();
const { api, showError } = useApi();
const { back } = useBack();
const { spaceId, editorPath, selectedMapObjectId, updateSelectedMapObject } = useMapEditorContext();
const { refresh } = useMapObjectBookables();

const linkPath = computed(() => `${editorPath.value}/${selectedMapObjectId.value}/edit/link`);

useAppHeader(() => ({ menu: 'footer', title: t('bookable_create'), back: linkPath.value }));

const form = ref<BookableFormData>({ name: '', description: '' });

async function save() {
  try {
    const bookable = await api<Bookable>(`/api/spaces/${spaceId.value}/bookables`, { method: 'POST', body: form.value });
    updateSelectedMapObject({ link: { type: 'bookable', bookable: bookable._id } });
    await refresh();
    await back(linkPath.value);
  }
  catch (error) {
    showError(error);
  }
}
</script>
