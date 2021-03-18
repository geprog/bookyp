<template>
  <Header title="Home" has-back>
    <Icon name="settings" @click="router.push({ name: 'settings-bookables' })" />
  </Header>
  <div class="home">
    <p>{{ t('hello') }}</p>
  </div>
  <ListItem label="Label One" status-color="bg-yellow-500" description="details" />
  <ListItem label="Label Two" status-color="bg-red-500" description="more details" />
  <ListItem
    label="Label Three"
    status-color="bg-green-500"
    description="even more details and longer longer longer longer longer longer longer longer longer longer longer longer longer longer longer longer longer"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/Header.vue';
import Icon from '~/components/Icon.vue';
import ListItem from '~/components/ListItem.vue';

export default defineComponent({
  name: 'Home',
  components: { Header, ListItem, Icon },
  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    return { router, t };
  },
});
</script>
