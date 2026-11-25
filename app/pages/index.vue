<template>
  <AppContent>
    <Spinner />
  </AppContent>
</template>

<script setup lang="ts">
definePageMeta({ auth: 'ignored' });

const { savedSpaceId } = useSavedSpace();

onMounted(() => {
  void navigateTo(savedSpaceId.value ? `/space/${savedSpaceId.value}/bookables/map` : '/spaces', { replace: true });
});
</script>
