<template>
  <header class="shadow-md flex flex-col">
    <div class="w-full max-w-5xl mx-auto">
      <div class="flex items-center p-2 content-center">
        <slot name="start">
          <IconButton v-if="hasBack" data-test="back-button" icon="arrow-left" @click="$router.go(-1)" />
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

<script lang="ts">
import { defineComponent } from 'vue';

import IconButton from '~/components/buttons/IconButton.vue';

export default defineComponent({
  name: 'Header',

  components: {
    IconButton,
  },

  props: {
    title: {
      type: String,
      required: true,
    },

    hasBack: {
      type: Boolean,
      required: false,
    },
  },

  setup() {
    return {};
  },
});
</script>
