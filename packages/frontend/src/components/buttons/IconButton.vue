<template>
  <button
    type="button"
    class="
      flex
      items-center
      justify-center
      h-9
      w-9
      bg-white
      rounded-full
      focus:outline-transparent
      hover:text-primary-dark
      disabled:cursor-not-allowed disabled:bg-gray-background disabled:text-white
    "
    :disabled="disabled"
  >
    <Icon data-test="button-icon" :name="icon" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '~/components/Icon.vue';
import { ExtractedComponentProp } from '~/vue-helpers';

export default defineComponent({
  name: 'IconButton',

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
