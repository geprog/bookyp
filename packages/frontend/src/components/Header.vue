<template>
  <header class="border-b-1 shadow-md flex flex-col">
    <div class="flex items-center p-4">
      <Button v-if="hasBack" data-test="back-button" icon-name="arrow-left" @click="router.go(-1)" />
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

import Button from '~/components/Button.vue';

export default defineComponent({
  name: 'Header',

  components: {
    Button,
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
