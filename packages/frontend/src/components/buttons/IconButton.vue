<template>
  <button
    type="button"
    class="
      flex
      items-center
      justify-center
      p-1
      bg-white
      rounded-full
      focus:outline-transparent
      hover:text-primary-dark
      disabled:cursor-default disabled:text-gray-inactive disabled:hover:text-gray-inactive
    "
    :disabled="disabled"
  >
    <Icon data-test="button-icon" :name="icon" :color="iconColor" />
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

    iconColor: {
      type: String,
      default: '',
    },

    disabled: {
      type: Boolean,
      required: false,
    },
  },
});
</script>
