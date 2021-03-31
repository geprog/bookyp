<template>
  <Header :title="t('bookable_details')" has-back>
    <button type="submit" form="bookable">
      <Icon name="check-mark" />
    </button>
  </Header>
  <form id="bookable" class="bookable mx-4" @submit.prevent="submit">
    <InputField icon-name="edit">
      <TextField v-model="bookable.name" :placeholder="t('name')" />
    </InputField>
    <InputField icon-name="description">
      <TextField v-model="bookable.description" :placeholder="t('description')" />
    </InputField>
  </form>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/Header.vue';
import Icon from '~/components/Icon.vue';
import InputField from '~/components/InputField.vue';
import TextField from '~/components/TextField.vue';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'BookableCreate',

  components: { Header, TextField, InputField, Icon },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();

    const bookable = reactive<Partial<Model.Bookable>>({
      description: '',
      name: '',
    });

    const submit = async () => {
      await feathers.service('bookables').create(bookable);
      await router.replace({ name: 'settings-bookables' });
    };

    return { submit, bookable, t };
  },
});
</script>
