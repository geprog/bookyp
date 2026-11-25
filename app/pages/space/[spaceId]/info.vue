<template>
  <AppContent class="flex-col">
    <SpaceInfo :space="space" />
    <AppButton v-if="space.importId" :href="mailtoClaim" class="mt-4 self-start">
      {{ t('claim_space') }}
    </AppButton>
  </AppContent>
</template>

<script setup lang="ts">
definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
const { space } = useCurrentSpace();
const { contactEmail } = useRuntimeConfig().public;

useAppHeader(() => ({ title: t('space_information'), back: space.value.importId ? '/spaces' : `/space/${space.value._id}/bookables/map` }));

const mailtoClaim = computed(() => `mailto:${contactEmail}?subject=${encodeURIComponent(`[${space.value._id}] Claim Space`)}`);
</script>
