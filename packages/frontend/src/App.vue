<template>
  <div class="app flex flex-col m-auto w-full h-full">
    <router-view />
    <UpdateApp />
    <DialogWrapper />
  </div>
</template>

<script lang="ts" setup>
import { onErrorCaptured } from 'vue';
import { useToast } from 'vue-toastification';
import { DialogWrapper } from 'vue3-promise-dialog';

import UpdateApp from '~/components/layout/UpdateApp.vue';

const toast = useToast();
// eslint-disable-next-line promise/prefer-await-to-callbacks
onErrorCaptured((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  toast.error(err.message);
});
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

.Vue-Toastification__container.top-right {
  @apply top-12;
}
.Vue-Toastification__toast--success {
  @apply bg-green-text text-gray-50;
}
.Vue-Toastification__toast--info {
  @apply bg-gray-500 text-gray-50;
}
.Vue-Toastification__toast--error {
  @apply bg-red-text text-gray-50;
}
.Vue-Toastification__progress-bar {
  @apply bg-gray-100;
}
</style>
