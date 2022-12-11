<template>
  <SettingsHeader :title="t('space_information')" />
  <AppContent>
    <div v-if="space">
      <LabelField v-if="space.name" icon-name="home">
        <TextField v-model="space.name" readonly data-test="space-name" :placeholder="t('name')" />
      </LabelField>
      <LabelField v-if="space.address" icon-name="location">
        <TextField v-model="space.address" readonly data-test="space-address" />
      </LabelField>
      <LabelField v-if="space.description" icon-name="text-box">
        <TextField v-model="space.description" readonly data-test="space-description" :placeholder="t('description')" />
      </LabelField>
      <LabelField v-if="space.email" icon-name="email">
        <TextField v-model="space.email" readonly :placeholder="t('email_space')" />
      </LabelField>
    </div>

    <Button
      icon="edit"
      :aria-label="t('edit_space_information')"
      :text="t('edit_space_information').toLocaleUpperCase()"
      class="mt-4 w-full"
      @click="$router.push({ name: 'settings-space-edit' })"
    />

    <SpacePlan v-if="space" :space="space" class="mt-8" />
  </AppContent>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpacePlan from '~/components/space/settings/SpacePlan.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { t } = useI18n();

const { currentSpace: space } = useCurrentSpace();
</script>
