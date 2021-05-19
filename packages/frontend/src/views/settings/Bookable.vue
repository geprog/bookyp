<template>
  <Header :title="t('bookable_details', { bookable: bookable && bookable.name })" has-back>
    <IconButton type="submit" form="bookable" icon="check-mark" />
  </Header>
  <BookableForm v-if="bookable" v-model:bookable="bookable" data-test="bookable-form" @save="saveBookable" />
</template>

<script lang="ts">
import { defineComponent, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BookableForm from '~/components/bookables/BookableForm.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/Header.vue';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'Bookable',

  components: {
    IconButton,
    Header,
    BookableForm,
  },

  props: {
    // used by toRef(props, 'bookableId')
    // eslint-disable-next-line vue/no-unused-properties
    bookableId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();

    const bookableId = toRef(props, 'bookableId');
    const { data: bookable } = useGet('bookables', bookableId);

    const saveBookable = async () => {
      /* istanbul ignore next */
      if (!bookable.value) {
        return;
      }

      await feathers.service('bookables').update(bookableId.value, bookable.value);
      await router.replace({ name: 'settings-bookables' });
    };

    return { t, bookable, saveBookable };
  },
});
</script>
