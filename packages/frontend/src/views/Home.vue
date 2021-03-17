<template>
  <Header title="Home" has-back>
    <Icon name="settings" @click="router.push({ name: 'settings-bookables' })" />
  </Header>
  <div class="home">
    <p>{{ t('hello') }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/Header.vue';
import Icon from '~/components/Icon.vue';

export default defineComponent({
  name: 'Home',
  components: { Header, Icon },
  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    return { router, t };
  },
});
</script>
