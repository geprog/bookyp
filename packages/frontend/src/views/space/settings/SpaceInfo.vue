<template>
  <SettingsHeader :title="t('space_information')" />
  <AppContent class="flex-col">
    <SpaceInfo :space="space" />

    <Button
      icon="edit"
      :aria-label="t('edit_space_information')"
      :text="t('edit_space_information').toLocaleUpperCase()"
      class="mt-4 w-full"
      @click="$router.push({ name: 'settings-space-edit' })"
    />
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import SpaceInfo from '~/components/space/SpaceInfo.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { t } = useI18n();

const { currentSpace: space } = useCurrentSpace();
</script>
