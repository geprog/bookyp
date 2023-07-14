<template>
  <header class="z-10 fixed top-0 bg-white w-full h-14 shadow-md flex justify-center">
    <div class="w-full h-full max-w-5xl">
      <div class="flex h-full items-center p-2 content-center">
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
            class="cursor-pointer flex-shrink-0 w-6 h-6"
            @click="$router.push({ name: 'spaces-list' })"
          />
        </slot>
        <h1 class="ml-2 mr-auto font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">
          {{ title }}
        </h1>
        <div class="flex space-x-2 items-center">
          <slot />
        </div>
      </div>
      <slot name="second" />
    </div>
  </header>
  <div class="w-full h-14 flex-shrink-0" />
</template>

<script lang="ts" setup>
import { RouteLocationRaw } from 'vue-router';

import BookypIcon from '~/assets/img/bookyp-logo.svg?component';
import IconButton from '~/components/buttons/IconButton.vue';
import { useBack } from '~/compositions/useBack';

defineProps<{
  title: string;
  backFallback?: RouteLocationRaw;
}>();

const { back } = useBack();
</script>
