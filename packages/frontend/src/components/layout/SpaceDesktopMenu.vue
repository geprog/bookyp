<template>
  <DesktopMenu>
    <template #space-buttons>
      <DesktopMenuItem v-if="!isAdmin" :text="t('info')" icon="info" :to="{ name: 'space-info' }" />
      <DesktopMenuItem v-if="isAdmin" :text="t('roles.admin.name')" icon="settings" :to="{ name: 'admin-area' }" />
    </template>
  </DesktopMenu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';

import DesktopMenu from './DesktopMenu.vue';
import DesktopMenuItem from './DesktopMenuItem.vue';

const { t } = useI18n();

const { currentSpace } = useCurrentSpace();

const isAdmin = ref(false);
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
</script>
