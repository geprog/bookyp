<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton icon="delete" icon-color="text-red-600 hover:text-red-200" :label="t('delete')" data-test="delete-button" @click="deleteBookable" />
    <IconButton type="submit" form="bookable" icon="check-mark" :label="t('save')" data-test="submit-bookable" />
  </Teleport>
  <AppContent>
    <BookableForm v-if="loaded" v-model="form" data-test="bookable-form" @save="save" />
    <Spinner v-else />
  </AppContent>
</template>

<script setup lang="ts">
import type { Bookable } from '#shared/types/models';
import type { BookableFormData } from '~/components/space/BookableForm.vue';

const { t } = useI18n();
const route = useRoute();
const { spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { openDialog } = useDialog();
const { back } = useBack();

const bookableId = computed(() => route.params.bookableId as string);
const { data: bookable } = useApiData(() => `bookable:${bookableId.value}`, () => $fetch<Bookable>(`/api/bookables/${bookableId.value}`), { watch: [bookableId] });

useAppHeader(() => ({ menu: 'none', title: t('bookable_details', { bookable: bookable.value?.name ?? '' }), back: `/space/${spaceId.value}/settings/bookable` }));

const form = ref<BookableFormData>({ name: '', description: '' });
const loaded = ref(false);
watch(bookable, (value) => {
  if (value && !loaded.value) {
    form.value = { name: value.name, description: value.description };
    loaded.value = true;
  }
}, { immediate: true });

async function save() {
  try {
    await api(`/api/bookables/${bookableId.value}`, { method: 'PATCH', body: form.value });
    await back(`/space/${spaceId.value}/settings/bookable`);
  }
  catch (error) {
    showError(error);
  }
}

async function deleteBookable() {
  if (!(await openDialog({ title: t('delete'), description: t('delete_dialog_description', { objectLabel: t('bookable') }), confirm: t('delete'), confirmColor: 'error' }))) {
    return;
  }
  try {
    await api(`/api/bookables/${bookableId.value}`, { method: 'DELETE' });
    await back(`/space/${spaceId.value}/settings/bookable`);
  }
  catch (error) {
    showError(error);
  }
}
</script>
