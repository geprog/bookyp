<template>
  <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'FloorPlan',

  setup() {
    const { data: spaces } = useFind('spaces');
    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });
    return { floorPlan };
  },
});
</script>
