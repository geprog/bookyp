<template>
  <div>
    <div class="flex h-12 w-24">
      <button
        type="button"
        class="
          flex flex-col
          p-2
          w-12
          hover:bg-gray-inactive
          bg-gray-background
          disabled:hover:bg-gray-background disabled:cursor-default disabled:text-gray-inactive
          items-center
          justify-center
          rounded-l-full
          hover:shadow-lg
        "
        :disabled="disabledLeft"
        @click.stop="$emit('left')"
      >
        <Icon :name="iconLeft" data-test="icon-start" />
      </button>
      <button
        type="button"
        class="
          flex flex-col
          bg-gray-background
          hover:bg-gray-inactive
          disabled:hover:bg-gray-background disabled:cursor-default disabled:text-gray-inactive
          p-2
          w-12
          items-center
          justify-center
          rounded-r-full
          hover:shadow-lg
        "
        :disabled="disabledRight"
        @click.stop="$emit('right')"
      >
        <Icon :name="iconRight" />
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import icons from '~/assets/icons';
import Icon from '~/components/Icon.vue';

export default defineComponent({
  name: 'ButtonPair',

  components: { Icon },

  props: {
    iconLeft: {
      type: String as PropType<keyof typeof icons>,
      required: true,
    },

    iconRight: {
      type: String as PropType<keyof typeof icons>,
      required: true,
    },

    disabledLeft: {
      type: Boolean,
    },

    disabledRight: {
      type: Boolean,
    },
  },

  emits: {
    left: () => true,
    right: () => true,
  },
});
</script>
