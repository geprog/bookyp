<template>
  <FooterMenu>
    <template #space-buttons>
      <router-link
        v-if="!isAdmin"
        :to="{ name: 'space-info' }"
        class="flex flex-col flex-grow items-center py-1.5 px-4"
      >
        <Icon name="info" />
        <span class="text-sm">{{ t('info') }}</span>
      </router-link>
      <router-link
        v-if="isAdmin"
        :to="{ name: 'admin-area' }"
        class="flex flex-col flex-grow items-center py-1.5 px-4"
        :class="{ 'router-link-exact-active ': showAdminButton }"
      >
        <Icon name="settings" />
        <span class="text-sm">{{ t('roles.admin.name') }}</span>
      </router-link>
    </template>
  </FooterMenu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import Icon from '~/components/Icon.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';

import FooterMenu from './FooterMenu.vue';

const { t } = useI18n();

const { currentSpace } = useCurrentSpace();
const route = useRoute();

const path = computed(() => route.path);
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
