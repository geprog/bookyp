<template>
  <Header :title="t('features')" :back-fallback="{ name: 'home' }" />

  <DesktopMenu />
  <AppContent>
    <div class="flex-grow flex">
      <Button
        class="m-auto"
        :text="
          allUnstableFeaturesEnabled
            ? t('feature_flags.disable_all_unstable_features')
            : t('feature_flags.enable_all_unstable_features')
        "
        @click="allUnstableFeaturesEnabled = !allUnstableFeaturesEnabled"
      />
    </div>
  </AppContent>

  <FooterMenu />
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import DesktopMenu from '~/components/layout/DesktopMenu.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import { useFeatureFlags } from '~/compositions/useFeatureFlags';

const { t } = useI18n();

const { allUnstableFeaturesEnabled } = useFeatureFlags();
</script>
