<template>
  <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import getCurrentSpace from '~/compositions/space/useCurrentSpace';
import { useAndRegisterViewBox } from '~/compositions/space/useViewBox';

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
    useAndRegisterViewBox('FloorPlan', floorPlan, { strokeWidth: 2 });
    return { floorPlan };
  },
});
</script>
