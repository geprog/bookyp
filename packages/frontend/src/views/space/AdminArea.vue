<template>
  <Header :title="t('admin_area')" :back-fallback="{ name: 'bookables-map' }" />

  <SpaceDesktopMenu />

  <AppContent v-if="space" class="!px-4 flex-col !h-full md:mt-16 mt-6">
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

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import CardSmall from '~/components/layout/CardSmall.vue';
import SpaceDesktopMenu from '~/components/layout/SpaceDesktopMenu.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import MenuItem from '~/components/menu/MenuItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { currentSpace: space } = useCurrentSpace();

const { t } = useI18n();
</script>
