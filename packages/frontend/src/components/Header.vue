<template>
  <header class="border-b-1 shadow-md flex flex-col">
    <div class="flex items-center p-4">
      <IconButton v-if="hasBack" data-test="back-button" icon="arrow-left" @click="router.go(-1)" />
      <span class="ml-8 mr-auto">{{ title }}</span>
      <div class="flex space-x-2">
        <slot />
      </div>
    </div>
    <slot name="second" />
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

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
    const router = useRouter();
    return { router };
  },
});
</script>
