<template>
  <div class="app flex flex-col m-auto w-full h-full">
    <router-view />
    <UpdateApp />
    <DialogWrapper />
  </div>
</template>

<script lang="ts" setup>
import { DialogWrapper } from 'vue3-promise-dialog';

import UpdateApp from '~/components/layout/UpdateApp.vue';
</script>

<style scoped>
.app {
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type vue-scoped-css/require-scoped -->
<style>
body {
  /* disable android pull to refresh feature */
  overscroll-behavior-y: contain;
}

*::-webkit-scrollbar {
  @apply bg-transparent w-12px h-12px;
}

* {
  scrollbar-width: thin;
}

*::-webkit-scrollbar-thumb {
  transition: background 0.2s ease-in-out;
  border: 3px solid transparent;
  @apply bg-gray-inactive rounded-full bg-clip-content;
}

*::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-active_second;
}

*::-webkit-scrollbar-corner {
  @apply bg-transparent;
}
</style>
