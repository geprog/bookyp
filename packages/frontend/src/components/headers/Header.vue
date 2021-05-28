<template>
  <header class="border-b-1 shadow-md flex flex-col">
    <div class="flex items-center p-4 content-center">
      <slot name="start">
        <IconButton v-if="hasBack" data-test="back-button" icon="arrow-left" @click="$router.go(-1)" />
      </slot>
      <h1 class="ml-4 mr-auto text-lg font-medium">{{ title }}</h1>
      <div class="flex space-x-2">
        <slot />
      </div>
    </div>
    <slot name="second" />
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
