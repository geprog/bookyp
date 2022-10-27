<template>
  <Header :title="t('bookable_details', { bookable: bookable && bookable.name })" has-back>
    <IconButton
      data-test="delete-button"
      icon="delete"
      icon-color="text-red-text hover:text-red-background"
      @click="modalVisible = true"
    />
    <IconButton type="submit" form="bookable" icon="check-mark" />
  </Header>
  <AppContent>
    <BookableForm v-if="bookable" v-model:bookable="bookable" data-test="bookable-form" @save="saveBookable" />
    <DeleteDialog
      data-test="delete-dialog"
      :object-label="t('bookable')"
      :visible="modalVisible"
      @confirmation="deleteBookable"
    />
  </AppContent>
</template>

<script lang="ts">
import { defineComponent, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BookableForm from '~/components/bookables/BookableForm.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import DeleteDialog from '~/components/DeleteDialog.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'Bookable',

  components: {
    AppContent,
    IconButton,
    Header,
    DeleteDialog,
    BookableForm,
  },

  props: {
    bookableId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();

    const bookableId = toRef(props, 'bookableId');
    const { data: bookable } = useGet('bookables', bookableId, ref({ query: { $disableSoftDelete: true } }));

    const saveBookable = async () => {
      /* istanbul ignore next */
      if (!bookable.value) {
        return;
      }

      await feathers.service('bookables').update(bookableId.value, bookable.value);
      await router.replace({ name: 'settings-bookables' });
    };
    const modalVisible = ref(false);
    async function deleteBookable(confirmation: boolean) {
      if (!confirmation) {
        modalVisible.value = false;
        return;
      }
      await feathers.service('bookables').remove(bookableId.value);
      router.back();
    }

    return { t, bookable, saveBookable, deleteBookable, modalVisible };
  },
});
</script>
