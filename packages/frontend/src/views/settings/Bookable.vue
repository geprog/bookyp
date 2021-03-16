<template>
  <Header :title="t('settings')" has-back>
    <button type="submit" form="bookable">
      <Icon name="check-mark" />
    </button>
  </Header>
  <form id="bookable" class="bookable" @submit.prevent="submit">
    <input v-model="bookableName" type="text" />
    <input v-model="description" type="text" />
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/Header.vue';
import Icon from '~/components/Icon.vue';
import useFeathers from '~/compositions/useFeathers';

export default defineComponent({
  name: 'Bookable',

  components: { Header, Icon },

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
