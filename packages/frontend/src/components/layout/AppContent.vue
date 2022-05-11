<template>
  <main class="w-full max-w-3xl px-4 <sm:px-2 md:mx-auto">
    <slot />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppContent',
});
</script>
