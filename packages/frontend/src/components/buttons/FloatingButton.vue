<template>
  <button
    type="button"
    class="flex items-center justify-center rounded-full h-12 w-12 cursor-pointer focus:outline-transparent hover:bg-primary-dark disabled:bg-gray-background disabled:cursor-not-allowed bg-primary-normal shadow-lg"
    :disabled="disabled"
  >
    <Icon data-test="floating-button-icon" :name="icon" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '~/components/Icon.vue';

export default defineComponent({
  name: 'FloatingButton',

  components: { Icon },

  props: {
    icon: {
      type: String,
      required: true,
    },

    disabled: {
      type: Boolean,
      required: false,
    },
  },
});
</script>
