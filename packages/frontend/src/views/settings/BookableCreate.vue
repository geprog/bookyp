<template>
  <Header :title="t('bookable_create')" has-back>
    <IconButton type="submit" form="bookable" icon="check-mark" />
  </Header>
  <BookableForm v-if="bookable" v-model:bookable="bookable" data-test="bookable-form" @save="saveBookable" />
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BookableForm from '~/components/bookables/BookableForm.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'BookableCreate',

  components: { Header, BookableForm, IconButton },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();
    const { spaceId } = useCurrentSpace();

    if (!spaceId.value) {
      throw new Error('Unexpected: A space must be selected');
    }

    const bookable = ref<Partial<Model.Bookable>>({
      description: '',
      name: '',
      space: spaceId.value,
    });

    const saveBookable = async () => {
      await router.replace({ name: 'settings-bookables' });
      await feathers.service('bookables').create(bookable.value);
    };

    return { saveBookable, bookable, t };
  },
});
</script>
