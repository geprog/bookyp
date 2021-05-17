<template>
  <component
    :is="icon"
    data-test="icon-component"
    :class="[color]"
    class="icon focus:text-primary-normal hover:text-primary-dark"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import icons from '~/assets/icons';

export default defineComponent({
  name: 'Icon',

  props: {
    name: {
      type: String as PropType<keyof typeof icons>,
      required: true,
    },

    color: {
      type: String,
      default: 'text-gray-active',
    },
  },

  setup(props) {
    const icon = icons[props.name];
    return { icon };
  },
});
</script>

<style scoped>
.icon ::v-deep *[fill]:not([fill='none']) {
  fill: currentColor;
}

.icon ::v-deep *[stroke]:not([stroke='none']) {
  stroke: currentColor;
}
</style>
