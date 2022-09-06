<template>
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
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import { useFeatureFlags } from '~/compositions/useFeatureFlags';

const { t } = useI18n();

const { allUnstableFeaturesEnabled } = useFeatureFlags();
</script>
