<template>
  <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
</template>

<script lang="ts">
import { defineComponent, PropType, toRef } from 'vue';

import { useAndRegisterViewBox } from '~/compositions/space/useViewBox';

export default defineComponent({
  name: 'FloorPlanEditing',
  props: {
    floorPlan: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },

  setup(props) {
    useAndRegisterViewBox('FloorPlan', toRef(props, 'floorPlan'), { strokeWidth: 2 });
  },
});
</script>
