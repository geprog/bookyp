<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton type="submit" form="bookable" icon="check-mark" :label="t('save')" data-test="submit-bookable" />
  </Teleport>
  <AppContent>
    <BookableForm v-model="form" data-test="bookable-form" @save="save" />
  </AppContent>
</template>

<script setup lang="ts">
import type { BookableFormData } from '~/components/space/BookableForm.vue';

const { t } = useI18n();
const { spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { back } = useBack();

useAppHeader(() => ({ menu: 'none', title: t('bookable_create'), back: `/space/${spaceId.value}/settings/bookable` }));

const form = ref<BookableFormData>({ name: '', description: '' });

async function save() {
  try {
    await api(`/api/spaces/${spaceId.value}/bookables`, { method: 'POST', body: form.value });
    await back(`/space/${spaceId.value}/settings/bookable`);
  }
  catch (error) {
    showError(error);
  }
}
</script>
