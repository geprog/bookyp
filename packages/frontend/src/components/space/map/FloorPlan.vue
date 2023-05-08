<template>
  <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
</template>

<script lang="ts">
import { computed, defineComponent, toRef } from 'vue';

import { useAndRegisterViewBox } from '~/compositions/space/useViewBox';
import useGet from '~/compositions/useGet';

export default defineComponent({
  name: 'FloorPlan',

  props: {
    spaceId: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const spaceId = toRef(props, 'spaceId');
    const { data: space } = useGet('spaces', spaceId);
    const floorPlan = computed(() => {
      if (space.value === undefined) {
        return [];
      }
      return space.value.floorPlan;
    });
    useAndRegisterViewBox('FloorPlan', floorPlan, { strokeWidth: 2 });
    return { floorPlan };
  },
});
</script>
