<template>
  <Header :title="t('admin_area')" :back-fallback="{ name: 'bookables-map' }" />

  <SpaceDesktopMenu />

  <AppContent v-if="space" class="!px-4 flex-col !h-full">
    <CardSmall
      class="h-16 w-full shadow-full mb-4"
      :image-url="space.imageUrl"
      :title="space.name"
      :subtitle="space.address"
      @image-error="refreshImage(space)"
    />

    <div v-for="menuItem in menuItems" :key="menuItem.icon">
      <MenuItem :icon="menuItem.icon" :to="{ name: menuItem.route }" :title="menuItem.title" :class="menuItem.class" />
    </div>
  </AppContent>

  <SpaceFooterMenu />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Header from '~/components/headers/Header.vue';
import { IconName } from '~/components/Icon.vue';
import AppContent from '~/components/layout/AppContent.vue';
import CardSmall from '~/components/layout/CardSmall.vue';
import SpaceDesktopMenu from '~/components/layout/SpaceDesktopMenu.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import MenuItem from '~/components/menu/MenuItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useSpaceImage } from '~/compositions/space/useSpaceImage';
import { openDialog } from '~/compositions/useDialog';
import { useSubscription } from '~/compositions/useSubscription';

const { refreshImage } = useSpaceImage();
const { currentSpace: space } = useCurrentSpace();
const { canAddNewBookings } = useSubscription();
const { t } = useI18n();
const router = useRouter();

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
    icon: 'location',
    route: 'space-bookings-and-requests-configuration',
    title: t('booking_and_requests'),
  },
  {
    icon: 'payment',
    route: 'space-settings-subscription',
    title: t('subscription.subscription'),
  },
];

const requestForUpgradeShown = ref(false);
watch(
  canAddNewBookings,
  async (_canAddNewBookings) => {
    if (_canAddNewBookings || requestForUpgradeShown.value) {
      return;
    }

    requestForUpgradeShown.value = true;

    if (
      await openDialog({
        label: t('subscription.upgrade_subscription'),
        description: t('subscription.used_all_bookings'),
        confirm: t('subscription.upgrade'),
      })
    ) {
      await router.push({ name: 'space-settings-subscription' });
    }
  },
  { immediate: true },
);
</script>
