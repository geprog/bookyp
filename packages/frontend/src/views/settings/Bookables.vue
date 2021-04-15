<template>
  <Header :title="t('settings')" has-back>
    <template #second>
      <SettingsTabs />
    </template>
  </Header>
  <div class="bookables">
    <ListItem
      v-for="bookable in bookables"
      :key="bookable._id"
      :label="bookable.name"
      status-color="bg-primary-normal"
      :description="bookable.description"
    />

    <FloatingButton
      class="fixed bottom-8 right-8"
      icon-name="add"
      @click="router.replace({ name: 'settings-bookable-create' })"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FloatingButton from '~/components/FloatingButton.vue';
import Header from '~/components/Header.vue';
import ListItem from '~/components/ListItem.vue';
import SettingsTabs from '~/components/SettingsTabs.vue';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Bookables',
  components: {
    SettingsTabs,
    FloatingButton,
    Header,
    ListItem,
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const router = useRouter();
    const { data: bookables } = useFind('bookables');

    return { router, t, bookables };
  },
});
</script>
