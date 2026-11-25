<template>
  <AppContent>
    <div class="flex grow">
      <AppButton class="m-auto" @click="allUnstableFeaturesEnabled = !allUnstableFeaturesEnabled">
        {{ allUnstableFeaturesEnabled ? t('feature_flags.disable_all_unstable_features') : t('feature_flags.enable_all_unstable_features') }}
      </AppButton>
    </div>
  </AppContent>
</template>

<script setup lang="ts">
definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
useAppHeader(() => ({ title: t('features'), back: '/' }));
const { allUnstableFeaturesEnabled } = useFeatureFlags();
</script>
