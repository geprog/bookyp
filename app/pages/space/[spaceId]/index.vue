<template>
  <Spinner />
</template>

<script setup lang="ts">
definePageMeta({ auth: 'ignored' });

const route = useRoute();
onMounted(() => {
  void navigateTo(`/space/${route.params.spaceId as string}/bookables/map`, { replace: true });
});
</script>
