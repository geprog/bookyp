<template>
  <button
    type="button"
    class="flex items-center justify-center rounded-md px-4 py-2 space-x-2 bg-primary-normal text-md font-bold text-white cursor-pointer focus:outline-transparent hover:bg-primary-dark disabled:bg-gray-background disabled:cursor-not-allowed"
    :disabled="disabled"
  >
    <Icon v-if="icon" data-test="button-icon" :name="icon" />
    <slot>
      <span v-if="text" data-test="button-text">{{ text }}</span>
    </slot>
    <Icon v-if="iconEnd" data-test="button-icon-end" :name="iconEnd" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '~/components/Icon.vue';
import { ExtractedComponentProp } from '~/vue-helpers';

export default defineComponent({
  name: 'Button',

  components: { Icon },

  props: {
    icon: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      default: null,
    },

    iconEnd: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      default: null,
    },

    text: {
      type: String,
      default: null,
    },

    disabled: {
      type: Boolean,
      required: false,
    },
  },
});
</script>
