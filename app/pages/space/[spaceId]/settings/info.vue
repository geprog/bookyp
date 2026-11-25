<template>
  <AppContent class="flex-col">
    <SpaceInfo :space="space" />
    <AppButton icon="edit" data-test="edit-space-button" :to="`/space/${spaceId}/settings/space/edit`" class="w-full mt-4">
      {{ t('edit_space_information').toLocaleUpperCase() }}
    </AppButton>
  </AppContent>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { space, spaceId } = useCurrentSpace();
useAppHeader(() => ({ title: t('space_information'), back: `/space/${spaceId.value}/settings` }));
</script>
