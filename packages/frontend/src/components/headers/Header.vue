<template>
  <header class="shadow-md flex flex-col">
    <div class="w-full max-w-5xl mx-auto">
      <div class="flex items-center p-2 content-center">
        <slot name="start">
          <IconButton
            v-if="backFallback"
            data-test="back-button"
            icon="arrow-left"
            @click="backFallback && back(backFallback)"
          />
          <BookypIcon
            v-else
            data-test="button-spaces"
            class="cursor-pointer flex-shrink-0"
            @click="$router.push({ name: 'spaces-list' })"
          />
        </slot>
        <h1 class="ml-2 mr-auto text-base font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
          {{ title }}
        </h1>
        <div class="flex space-x-2">
          <slot />
        </div>
      </div>
      <slot name="second" />
    </div>
  </header>
</template>

<script lang="ts" setup>
import { RouteLocationRaw } from 'vue-router';

import BookypIcon from '~/assets/icons/bookyp.svg?component';
import IconButton from '~/components/buttons/IconButton.vue';
import { back } from '~/compositions/useRouter';

defineProps<{
  title: string;
  backFallback?: RouteLocationRaw;
}>();
</script>
