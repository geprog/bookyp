<template>
  <Spinner />
</template>

<script setup lang="ts">
const route = useRoute();
onMounted(() => {
  void navigateTo(`/space/${route.params.spaceId as string}/bookings/calendar`, { replace: true });
});
</script>
