<template>
  <Header
    :title="t('space_information')"
    :back-fallback="space?.importId ? { name: 'spaces-list' } : { name: 'bookables-map' }"
  />
  <AppContent>
    <SpaceInfo :space="space" />
    <Button v-if="space?.importId" :href="mailtoUpgrade">
      {{ t('claim_space') }}
    </Button>
  </AppContent>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceInfo from '~/components/space/SpaceInfo.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { t } = useI18n();

const { currentSpace: space } = useCurrentSpace();

const mailtoClaimSubject = encodeURIComponent(`[${space.value?._id || ''}] Claim Space`);
const mailtoUpgrade = `mailto:bookyp@geprog.com?subject=${mailtoClaimSubject}`;
</script>
