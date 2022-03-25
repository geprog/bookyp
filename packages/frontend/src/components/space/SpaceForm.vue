<template>
  <form v-if="space" id="space" data-test="form" class="space mx-4" @submit.prevent="saveSpace">
    <InputField icon-name="home" class="ml-1">
      <TextField v-model="spaceCreate.name" data-test="form-name" :placeholder="t('name')" />
    </InputField>
    <InputField icon-name="location">
      <TextField v-model="spaceCreate.address" data-test="form-address" :placeholder="t('address')" />
    </InputField>
    <InputField icon-name="text-box">
      <TextField v-model="spaceCreate.description" data-test="form-description" :placeholder="t('description')" />
    </InputField>
  </form>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, PropType, reactive, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import InputField from '~/components/InputField.vue';
import TextField from '~/components/TextField.vue';

export default defineComponent({
  name: 'SpaceForm',

  components: {
    InputField,
    TextField,
  },

  props: {
    space: {
      type: Object as PropType<Partial<Model.Space>>,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'update:space': (_space: Partial<Model.Space>) => true,
    save: () => true,
  },

  setup(props, { emit }) {
    const { t } = useI18n();

    const space = toRef(props, 'space');

    const spaceCreate = reactive({
      name: computed({
        get() {
          return space.value.name || '';
        },
        set(name: string) {
          emit('update:space', { ...space.value, name });
        },
      }),
      address: computed({
        get() {
          return space.value.address || '';
        },
        set(address: string) {
          emit('update:space', { ...space.value, address });
        },
      }),
      description: computed({
        get() {
          return space.value.description || '';
        },
        set(description: string) {
          emit('update:space', { ...space.value, description });
        },
      }),
    });

    const saveSpace = () => {
      emit('save');
    };
    return { t, saveSpace, spaceCreate };
  },
});
</script>
