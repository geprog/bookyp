<template>
  <Header
    :title="t('bookable_details', { bookable: bookable && bookable.name })"
    :back-fallback="{ name: 'settings-bookables' }"
  >
    <template #right>
      <IconButton
        data-test="delete-button"
        icon="delete"
        icon-color="text-red-text hover:text-red-background"
        @click="deleteBookable"
      />
      <IconButton type="submit" form="bookable" icon="check-mark" />
    </template>
  </Header>
  <AppContent>
    <BookableForm v-if="bookable" v-model:bookable="bookable" data-test="bookable-form" @save="saveBookable" />
  </AppContent>
</template>

<script lang="ts" setup>
import { ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import BookableForm from '~/components/space/bookable/BookableForm.vue';
import { useBack } from '~/compositions/useBack';
import { openDialog } from '~/compositions/useDialog';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  bookableId: string;
}>();

const { t } = useI18n();
const feathers = useFeathers();
const { back } = useBack();

const bookableId = toRef(props, 'bookableId');
const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));

const saveBookable = async () => {
  /* istanbul ignore next */
  if (!bookable.value) {
    return;
  }

  await feathers.service('bookables').update(bookableId.value, bookable.value);
  void back({ name: 'settings-bookables' });
};

async function deleteBookable() {
  if (
    !(await openDialog({
      description: t('delete_dialog_description', { objectLabel: t('bookable') }),
      label: t('delete'),
      confirm: t('delete'),
    }))
  ) {
    return;
  }

  await feathers.service('bookables').remove(bookableId.value);
  void back({ name: 'settings-bookables' });
}
</script>
