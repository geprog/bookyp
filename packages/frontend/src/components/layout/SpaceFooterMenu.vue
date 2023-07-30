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
      <router-link v-if="isAdmin" :to="{ name: 'admin-area' }" class="flex flex-col flex-grow items-center py-1.5 px-4">
        <Icon name="settings" />
        <span class="text-sm">{{ t('roles.admin.name') }}</span>
      </router-link>
    </template>
  </FooterMenu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import Icon from '~/components/Icon.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';

import FooterMenu from './FooterMenu.vue';

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
