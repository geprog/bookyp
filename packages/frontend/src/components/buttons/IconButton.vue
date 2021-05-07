<template>
  <button
    type="button"
    class="flex items-center justify-center rounded-full h-9 w-9 bg-white focus:outline-transparent hover:shadow-md hover:bg-gray-dark disabled:cursor-not-allowed disabled:bg-gray-background"
    :disabled="disabled"
  >
    <Icon data-test="button-icon" :name="icon" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '~/components/Icon.vue';

export default defineComponent({
  name: 'IconButton',

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
