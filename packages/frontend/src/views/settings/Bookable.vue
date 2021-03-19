<template>
  <Header :title="t('bookable_details')" has-back>
    <button type="submit" form="bookable">
      <Icon name="check-mark" />
    </button>
  </Header>
  <form id="bookable" class="bookable mx-4" @submit.prevent="submit">
    <InputField icon-name="edit">
      <TextField v-model="bookableName" :placeholder="t('name')" />
    </InputField>
    <InputField icon-name="description">
      <TextField v-model="description" :placeholder="t('description')" />
    </InputField>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/Header.vue';
import Icon from '~/components/Icon.vue';
import InputField from '~/components/InputField.vue';
import TextField from '~/components/TextField.vue';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'Bookable',

  components: { Header, TextField, InputField, Icon },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    const feathers = useFeathers();

    const bookableName = ref('');
    const description = ref('');

    const submit = async () => {
      await feathers.service('bookables').create({ name: bookableName.value, description: description.value });
      await router.replace({ name: 'settings-bookables' });
    };

    return { submit, bookableName, description, t };
  },
});
</script>
