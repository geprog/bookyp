<template>
  <Header has-back :title="t('space_information')" />
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
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import TextField from '~/components/TextField.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { t } = useI18n();

const { currentSpace: space } = useCurrentSpace();
</script>
