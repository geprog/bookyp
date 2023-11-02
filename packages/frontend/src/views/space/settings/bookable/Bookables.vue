<template>
  <SettingsHeader :title="t('bookables')" />

  <AppContent class="flex-col">
    <ProgressIndicator v-if="isLoading" />
    <template v-else>
      <div class="m-3">
        <Button
          v-if="canAddNewBookables"
          class="w-full"
          icon="add"
          data-test="button-add-bookable"
          :text="t('bookable_create').toLocaleUpperCase()"
          @click="$router.push({ name: 'settings-bookable-create' })"
        />

        <router-link v-else :to="{ name: 'space-settings-subscription' }">
          <Button icon="info" class="w-full" :text="t('subscription.max_bookables_reached')" />
        </router-link>
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

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';
import { useSubscription } from '~/compositions/useSubscription';

const { t } = useI18n();
const { spaceId } = useCurrentSpace();
const { canAddNewBookables } = useSubscription();

const { data: bookables, isLoading } = useFind(
  'bookables',
  computed(() => ({ query: { space: spaceId.value } })),
);
</script>
