<template>
  <Header :title="t('settings')" has-back>
    <template #second>
      <SettingsTabs />
    </template>
  </Header>

  <div class="w-full max-w-2xl mx-auto">
    <ListItem
      v-for="bookable in bookables"
      :key="bookable._id"
      :label="bookable.name"
      :description="bookable.description"
      class="cursor-pointer m-3"
      @click="$router.push({ name: 'settings-bookable', params: { bookableId: bookable._id } })"
    />

    <FloatingButton
      :aria-label="t('bookable_create')"
      class="fixed bottom-8 right-8"
      icon="add"
      @click="$router.replace({ name: 'settings-bookable-create' })"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import Header from '~/components/headers/Header.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import SettingsTabs from '~/components/tabs/SettingsTabs.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
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
    const { spaceId } = useCurrentSpace();

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ query: { space: spaceId.value } })),
    );

    return { t, bookables };
  },
});
</script>
