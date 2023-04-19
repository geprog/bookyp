<template>
  <component :is="icon" data-test="icon-component" :class="[color]" class="icon flex-shrink-0" />
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue';

import icons from '~/assets/icons';

// TODO: use prop type extraction instead, when available: https://github.com/vuejs/vue-next/pull/2179
export type IconName = keyof typeof icons;

const props = withDefaults(
  defineProps<{
    name: IconName;
    color?: string;
  }>(),
  {
    color: '',
  },
);
const iconName = toRef(props, 'name');
const icon = computed(() => icons[iconName.value]);
</script>

<style scoped>
.icon ::v-deep(*[fill]:not([fill='none'])) {
  fill: currentColor;
}

.icon ::v-deep(*[stroke]:not([stroke='none'])) {
  stroke: currentColor;
}
</style>
