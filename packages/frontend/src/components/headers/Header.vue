<template>
  <header class="shadow-md flex flex-col">
    <div class="w-full max-w-5xl mx-auto">
      <div class="flex items-center p-2 content-center">
        <BookypIcon data-test="button-spaces" @click="$router.push({ name: 'spaces-list' })" />
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

<script lang="ts">
import { defineComponent } from 'vue';

import BookypIcon from '~/assets/icons/bookyp.svg?component';

export default defineComponent({
  name: 'Header',

  components: {
    BookypIcon,
  },

  props: {
    title: {
      type: String,
      required: true,
    },
  },

  setup() {
    return {};
  },
});
</script>
