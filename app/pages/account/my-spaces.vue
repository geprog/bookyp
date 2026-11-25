<template>
  <div v-if="sortedSpaces.length === 0" class="flex h-4/5 w-full items-center justify-center self-center text-center">
    <Spinner v-if="loading" />
    <span v-else class="text-gray-400">{{ t('no_admin_spaces') }}</span>
  </div>
  <AppContent v-else class="flex-col">
    <h2 class="m-3 h-6 text-lg font-bold">
      {{ t('spaces_admin') }}
    </h2>
    <SpaceCard v-for="space in sortedSpaces" :key="space._id" :space="space" />
  </AppContent>
  <div class="fixed bottom-12 z-10 mb-4 flex w-full items-end justify-center space-x-8 md:bottom-0">
    <FloatingButton icon="i-bookyp-add" :text="t('space_create')" data-test="create-space-button" @click="navigateTo('/space/create')" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { isStarred } = useAuth();

useAppHeader(() => ({ title: t('my_spaces'), back: '/account' }));

const { spaces, loading } = useSpaces({ admin: true });

const sortedSpaces = computed(() =>
  (spaces.value ?? [])
    .map(space => ({ ...space, starred: isStarred(space._id) }))
    .sort((a, b) => (a.starred === b.starred ? a.name.localeCompare(b.name) : a.starred ? -1 : 1)),
);
</script>
