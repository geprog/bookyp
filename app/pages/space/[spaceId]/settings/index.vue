<template>
  <AppContent class="h-full! flex-col px-4!">
    <CardSmall class="mb-4 h-16 w-full shadow-full" :image-url="space.imageUrl" :title="space.name" :subtitle="space.address" />

    <MenuItem v-for="item in menuItems" :key="item.route" :icon="item.icon" :to="`/space/${spaceId}/${item.route}`" :title="item.title" :class="item.class" :data-test="item.dataTest" />
  </AppContent>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { space, spaceId } = useCurrentSpace();
const { openDialog } = useDialog();

useAppHeader(() => ({ title: t('admin_area'), back: `/space/${spaceId.value}/bookables/map` }));

const menuItems = computed(() => [
  { icon: 'i-bookyp-diagram', route: 'bookings/calendar', title: t('space_analytics'), dataTest: 'button-space-analytics' },
  { icon: 'i-bookyp-request', route: 'settings/pending-requests', title: t('pending_requests'), dataTest: 'button-pending-requests' },
  { icon: 'i-bookyp-floor-plan', route: 'settings/map-editor', title: t('space_editor'), class: 'border-t', dataTest: 'button-map-objects' },
  { icon: 'i-bookyp-ticket', route: 'settings/bookable', title: t('bookables'), dataTest: 'button-bookables' },
  { icon: 'i-bookyp-people', route: 'settings/member', title: t('members'), class: 'border-t', dataTest: 'button-space-members' },
  { icon: 'i-bookyp-info', route: 'settings/info', title: t('space_information'), dataTest: 'button-space-information' },
  { icon: 'i-bookyp-location', route: 'settings/bookings-and-request-config', title: t('booking_and_requests'), dataTest: 'button-bookings-and-requests' },
  { icon: 'i-bookyp-payment', route: 'settings/subscription', title: t('subscription.subscription'), dataTest: 'button-subscription' },
]);

// remind the admin to upgrade when the free bookings of the month are used up
const { canAddNewBookings } = useSubscriptionLimits(spaceId);
const requestForUpgradeShown = useState('upgrade-reminder-shown', () => false);
watch(canAddNewBookings, async (value) => {
  if (value || requestForUpgradeShown.value) {
    return;
  }
  requestForUpgradeShown.value = true;
  if (await openDialog({ title: t('subscription.upgrade_subscription'), description: t('subscription.used_all_bookings'), confirm: t('subscription.upgrade') })) {
    await navigateTo(`/space/${spaceId.value}/settings/subscription`);
  }
}, { immediate: true });
</script>
