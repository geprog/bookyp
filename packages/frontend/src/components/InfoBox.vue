<template>
  <div class="flex items-center p-4 bg-gray-background rounded-full text-center">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InfoBox',
});
</script>
