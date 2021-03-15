<template>
  <Header title="Home" has-back>
    <span>This is the right side content</span>

    <template #second>
      <div class="w-full bg-red-500">Mega nice</div>
    </template>
  </Header>
  <div class="home">
    <p>{{ t('hello') }} ;-)</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/Header.vue';

export default defineComponent({
  name: 'Home',
  components: { Header },
  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    return { t };
  },
});
</script>
