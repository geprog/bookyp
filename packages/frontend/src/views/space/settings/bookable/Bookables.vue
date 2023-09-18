<template>
  <SettingsHeader :title="t('bookables')" />

  <AppContent class="flex-col">
    <ProgressIndicator v-if="isLoading" />
    <template v-else>
      <div class="m-3">
        <Button
          class="w-full"
          icon="add"
          data-test="button-add-bookable"
          :text="t('bookable_create').toLocaleUpperCase()"
          @click="$router.push({ name: 'settings-bookable-create' })"
        />
      </div>
      <ListItem
        v-for="bookable in bookables"
        :key="bookable._id"
        :label="bookable.name"
        :description="bookable.description"
        class="cursor-pointer m-3"
        data-test="bookable-item"
        @click="$router.push({ name: 'settings-bookable', params: { bookableId: bookable._id } })"
      />
    </template>
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Bookables',
  components: {
    ListItem,
    SettingsHeader,
    AppContent,
    Button,
    ProgressIndicator,
    SpaceFooterMenu,
  },

  setup() {
    const { t } = useI18n();
    const { spaceId } = useCurrentSpace();

    const { data: bookables, isLoading } = useFind(
      'bookables',
      computed(() => ({ query: { space: spaceId.value } })),
    );

    return { t, bookables, isLoading };
  },
});
</script>
