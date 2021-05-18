<template>
  <button
    type="button"
    class="flex items-center justify-center rounded-full h-12 w-12 cursor-pointer hover:bg-primary-dark focus:outline-transparent disabled:bg-gray-background disabled:cursor-not-allowed bg-primary-normal shadow-lg"
    :disabled="disabled"
  >
    <Icon data-test="floating-button-icon" :name="icon" color="text-white" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '~/components/Icon.vue';
import { ExtractedComponentProp } from '~/vue-helpers';

export default defineComponent({
  name: 'FloatingButton',

  components: { Icon },

  props: {
    icon: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      required: true,
    },

    disabled: {
      type: Boolean,
      required: false,
    },
  },
});
</script>
