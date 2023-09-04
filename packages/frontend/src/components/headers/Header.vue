<template>
  <header class="z-10 fixed top-0 bg-white w-full h-14 shadow-md flex justify-center">
    <div
      class="flex w-full h-full items-center justify-between p-2 max-w-5xl"
      :class="{ 'justify-end': !backFallback || !title }"
    >
      <div class="flex items-center basis-full">
        <IconButton
          v-if="backFallback"
          data-test="back-button"
          icon="dismiss"
          :disabled="disableFallback"
          @click="backFallback && back(backFallback)"
        />
        <span v-if="title" class="line-clamp-1">{{ title }}</span>
      </div>
      <BookypIcon
        class="cursor-pointer flex-shrink-0 w-auto h-8 justify-center"
        @click="$router.push({ name: 'spaces-list' })"
      />
      <div v-if="slot.right" class="flex space-x-2 items-center justify-end basis-full" :class="rightClass">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue';
import { RouteLocationRaw } from 'vue-router';

import BookypIcon from '~/assets/img/bookyp-logo-text.svg?component';
import IconButton from '~/components/buttons/IconButton.vue';
import { useBack } from '~/compositions/useBack';

defineProps<{
  title: string;
  backFallback?: RouteLocationRaw;
  disableFallback?: boolean;
  rightClass?: string;
}>();

const { back } = useBack();

const slot = useSlots();
</script>
