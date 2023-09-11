<template>
  <Header :title="t('admin_area')" :back-fallback="{ name: 'bookables-map' }" />

  <SpaceDesktopMenu />

  <AppContent v-if="space" class="!px-4 flex-col !h-full">
    <CardSmall
      class="h-16 w-full shadow-full mb-4"
      :image-url="space.image"
      :title="space.name"
      :subtitle="space.address"
    />

    <div v-for="menuItem in menuItems" :key="menuItem.icon">
      <MenuItem :icon="menuItem.icon" :to="{ name: menuItem.route }" :title="menuItem.title" :class="menuItem.class" />
    </div>
  </AppContent>

  <SpaceFooterMenu />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import { IconName } from '~/components/Icon.vue';
import AppContent from '~/components/layout/AppContent.vue';
import CardSmall from '~/components/layout/CardSmall.vue';
import SpaceDesktopMenu from '~/components/layout/SpaceDesktopMenu.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import MenuItem from '~/components/menu/MenuItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { currentSpace: space } = useCurrentSpace();

const { t } = useI18n();

const menuItems: { icon: IconName; route: string; title: string; class?: string }[] = [
  {
    icon: 'diagram',
    route: 'space-bookings-calendar',
    title: t('space_analytics'),
  },
  {
    icon: 'request',
    route: 'space-pending-requests',
    title: t('pending_requests'),
  },
  {
    icon: 'floor-plan',
    route: 'settings-space-map',
    title: t('space_editor'),
    class: 'border-t-1 border-gray-500',
  },
  {
    icon: 'ticket',
    route: 'settings-bookables',
    title: t('bookables'),
  },
  {
    icon: 'people',
    route: 'settings-space-members',
    title: t('members'),
    class: 'border-t-1 border-gray-500',
  },
  {
    icon: 'info',
    route: 'settings-space-info',
    title: t('space_information'),
  },
  {
    icon: 'payment',
    route: 'space-settings-subscription',
    title: t('subscription.subscription'),
  },
];
</script>
