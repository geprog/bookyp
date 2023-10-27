<template>
  <DesktopMenu>
    <template #space-buttons>
      <DesktopMenuItem v-if="!isAdmin" :text="t('info')" icon="info" :to="{ name: 'space-info' }" />
      <DesktopMenuItem
        v-if="isAdmin"
        :class="{ 'router-link-exact-active ': showAdminButton }"
        :text="t('roles.admin.name')"
        icon="settings"
        :to="{ name: 'space-settings' }"
      />
    </template>
  </DesktopMenu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';

import DesktopMenu from './DesktopMenu.vue';
import DesktopMenuItem from './DesktopMenuItem.vue';

const { t } = useI18n();

const { currentSpace } = useCurrentSpace();

const isAdmin = ref(false);
const route = useRoute();
const path = computed(() => route.path);
watch(
  currentSpace,
  async () => {
    if (currentSpace.value === undefined) {
      isAdmin.value = false;
      return;
    }
    isAdmin.value = await isSpaceAdmin(currentSpace.value);
  },
  { immediate: true },
);
const showAdminButton = computed<boolean>(
  () =>
    isAdmin.value &&
    (path.value.includes('/adminArea') ||
      path.value.includes('/bookings/calendar') ||
      path.value.includes('bookings/members') ||
      path.value.includes('settings/pendingRequests') ||
      path.value.includes('/settings/map-editor') ||
      path.value.includes('/settings/bookable') ||
      path.value.includes('settings/member') ||
      path.value.includes('settings/info') ||
      path.value.includes('settings/subscription')),
);
</script>
