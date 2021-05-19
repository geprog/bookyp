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
      :description="bookable.description"
      class="cursor-pointer"
      @click="$router.push({ name: 'settings-bookable', params: { bookableId: bookable._id } })"
    />

    <FloatingButton
      class="fixed bottom-8 right-8"
      icon="add"
      @click="$router.replace({ name: 'settings-bookable-create' })"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import Header from '~/components/Header.vue';
import ListItem from '~/components/ListItem.vue';
import SettingsTabs from '~/components/tabs/SettingsTabs.vue';
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
    const { data: bookables } = useFind('bookables');

    return { t, bookables };
  },
});
</script>
