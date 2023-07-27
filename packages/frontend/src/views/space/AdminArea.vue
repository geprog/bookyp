<template>
  <header class="z-10 fixed top-0 bg-white w-full h-14 shadow-md flex justify-center">
    <div class="w-full h-full max-w-5xl">
      <div class="flex h-full items-center p-2 content-center">
        <IconButton icon="close" div @click="$router.replace({ name: 'bookables-map' })" />
        <h1 class="ml-2 mr-auto font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
          {{ t('admin_area') }}
        </h1>
        <div class="flex space-x-2">
          <img src="/src/assets/img/bookyp-new-logo.svg?url" />
        </div>
      </div>
    </div>
  </header>

  <AppContent v-if="space" class="!px-4 flex-col mt-18 !h-full">
    <CardSmall class="h-16 w-full shadow-full" :image-url="space.image" :title="space.name" :subtitle="space.address" />

    <MenuItem
      class="flex mt-4"
      icon="diagram"
      :to="{ name: 'space-bookings-calendar' }"
      :title="t('space_analytics')"
    />
    <MenuItem
      class="border-t-1 border-gray-500"
      icon="floor-plan"
      :to="{ name: 'settings-space-map' }"
      :title="t('space_editor')"
    />

    <MenuItem
      class="border-t-1 border-gray-500"
      icon="ticket"
      :to="{ name: 'settings-bookables' }"
      :title="t('bookables')"
    />

    <MenuItem icon="people" :to="{ name: 'settings-space-members' }" :title="t('members')" />

    <MenuItem icon="info" :to="{ name: 'settings-space-info' }" :title="t('space_information')" />

    <MenuItem icon="payment" :to="{ name: 'space-settings-subscription' }" :title="t('subscription.subscription')" />
  </AppContent>

  <SpaceFooterMenu />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import AppContent from '~/components/layout/AppContent.vue';
import CardSmall from '~/components/layout/CardSmall.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import MenuItem from '~/components/menu/MenuItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { currentSpace: space } = useCurrentSpace();

const { t } = useI18n();
</script>
