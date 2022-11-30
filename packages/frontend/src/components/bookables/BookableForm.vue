<template>
  <form
    v-if="bookable"
    id="bookable"
    data-test="form"
    class="bookable mx-4 mx-auto w-full"
    @submit.prevent="saveBookable"
  >
    <LabelField icon-name="edit">
      <TextField v-model="bookableForm.name" data-test="form-name" :placeholder="t('name')" />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField v-model="bookableForm.description" data-test="form-description" :placeholder="t('description')" />
    </LabelField>
  </form>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, PropType, reactive, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelField from '~/components/LabelField.vue';
import TextField from '~/components/TextField.vue';

export default defineComponent({
  name: 'BookableForm',

  components: {
    LabelField,
    TextField,
  },

  props: {
    bookable: {
      type: Object as PropType<Partial<Model.Bookable>>,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:bookable': (__bookable: Partial<Model.Bookable>) => true,
    save: () => true,
  },

  setup(props, { emit }) {
    const { t } = useI18n();

    const bookable = toRef(props, 'bookable');

    const bookableForm = reactive({
      name: computed({
        get() {
          return bookable.value.name || '';
        },
        set(name: string) {
          emit('update:bookable', { ...bookable.value, name });
        },
      }),
      description: computed({
        get() {
          return bookable.value.description || '';
        },
        set(description: string) {
          emit('update:bookable', { ...bookable.value, description });
        },
      }),
    });

    const saveBookable = () => {
      emit('save');
    };

    return { t, bookableForm, saveBookable };
  },
});
</script>
