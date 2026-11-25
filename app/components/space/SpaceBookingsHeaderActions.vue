<template>
  <Teleport to="#app-header-actions" defer>
    <IconButton
      icon="calendar"
      :icon-color="active === 'calendar' ? 'text-amber-500' : ''"
      :label="t('calendar.week')"
      data-test="btn-space-bookings-calendar"
      @click="navigateTo(`/space/${spaceId}/bookings/calendar`, { replace: true })"
    />
    <IconButton
      icon="apps-list"
      :icon-color="active === 'members' ? 'text-amber-500' : ''"
      :label="t('members_with_bookings')"
      data-test="btn-space-bookings-members"
      @click="navigateTo(`/space/${spaceId}/bookings/members`, { replace: true })"
    />
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ active: 'calendar' | 'members' }>();
const { t } = useI18n();
const { spaceId } = useCurrentSpace();
</script>
