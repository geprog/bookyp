<template>
  <SettingsHeader :title="t('space_information')" />
  <AppContent>
    <SpaceInfo :space="space" />

    <Button
      icon="edit"
      :aria-label="t('edit_space_information')"
      :text="t('edit_space_information').toLocaleUpperCase()"
      class="mt-4 w-full"
      @click="$router.push({ name: 'settings-space-edit' })"
    />

    <SpacePlan v-if="!allUnstableFeaturesEnabled && space" :space="space" class="mt-8" />
  </AppContent>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpacePlan from '~/components/space/settings/SpacePlanOld.vue';
import SpaceInfo from '~/components/space/SpaceInfo.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useFeatureFlags } from '~/compositions/useFeatureFlags';

const { t } = useI18n();

const { currentSpace: space } = useCurrentSpace();

const { allUnstableFeaturesEnabled } = useFeatureFlags();
</script>
