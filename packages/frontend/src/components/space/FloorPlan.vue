<template>
  <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import getCurrentSpace from '~/compositions/space/useCurrentSpace';

export default defineComponent({
  name: 'FloorPlan',

  setup() {
    const { data: currentSpace } = getCurrentSpace();
    const floorPlan = computed(() => {
      if (currentSpace.value === undefined) {
        return [];
      }
      return currentSpace.value.floorPlan;
    });

    return {
      floorPlan,
    };
  },
});
</script>
