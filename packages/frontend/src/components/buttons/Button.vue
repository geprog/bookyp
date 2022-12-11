<template>
  <button
    type="button"
    class="
      flex
      items-center
      justify-center
      rounded-md
      px-4
      py-2
      space-x-2
      text-md
      font-bold
      text-white
      cursor-pointer
      focus:outline-transparent
      disabled:cursor-not-allowed
      border-2
    "
    :class="{
      'border-primary-normal hover:border-primary-dark disabled:border-gray-background text-primary-normal hover:text-primary-dark disabled:text-gray-background':
        outlined,
      'border-transparent bg-primary-normal hover:bg-primary-dark disabled:bg-gray-background': !outlined,
    }"
    :disabled="disabled"
  >
    <Icon
      v-if="icon"
      data-test="button-icon"
      :class="{
        'text-inherit': outlined,
        'text-white': !outlined,
      }"
      :name="icon"
    />
    <slot>
      <span v-if="text" data-test="button-text">{{ text }}</span>
    </slot>
    <Icon
      v-if="iconEnd"
      data-test="button-icon-end"
      :class="{ 'text-inherit': outlined, 'text-white': !outlined }"
      :name="iconEnd"
    />
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

    outlined: {
      type: Boolean,
      required: false,
    },
  },
});
</script>
