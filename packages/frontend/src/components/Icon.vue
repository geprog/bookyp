<template>
  <component :is="icon" data-test="icon-component" :class="[color]" class="icon" />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRef } from 'vue';

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
      default: '',
    },
  },

  setup(props) {
    const iconName = toRef(props, 'name');
    const icon = computed(() => icons[iconName.value]);
    return { icon };
  },
});
</script>

<style scoped>
.icon ::v-deep(*[fill]:not([fill='none'])) {
  fill: currentColor;
}

.icon ::v-deep(*[stroke]:not([stroke='none'])) {
  stroke: currentColor;
}
</style>
