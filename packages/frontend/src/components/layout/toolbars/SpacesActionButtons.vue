<template>
  <div class="fixed bottom-0 w-full flex justify-center items-end space-x-8 mb-4">
    <ToggleBar
      :selected="$route.name === 'spaces-map' ? 'start' : 'end'"
      start-icon="map"
      end-icon="apps-list"
      @selected-start="$router.replace({ name: 'spaces-map' })"
      @selected-end="$router.replace({ name: 'spaces-list' })"
    />
  </div>
</template>

<script lang="ts" setup>
import ToggleBar from '~/components/buttons/ToggleBar.vue';
</script>
