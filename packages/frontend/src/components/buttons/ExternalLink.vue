<template>
  <a target="_blank" rel="noopener noreferrer" class="flex items-center hover:text-primary-dark">
    <slot />
  </a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ExternalLink',
});
</script>
