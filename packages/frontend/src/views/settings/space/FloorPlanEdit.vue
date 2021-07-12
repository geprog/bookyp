<template>
  <div class="m-4 flex flex-col flex-grow min-h-0">
    <SpaceMap data-test="space-map">
      <FloorPlan />
      <MapObjects />
    </SpaceMap>
    <div class="ml-auto flex flex-row">
      <slot name="toggleBar" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';

export default defineComponent({
  name: 'FloorPlanEdit',
  components: {
    SpaceMap,
    FloorPlan,
    MapObjects,
  },

  props: {
    // eslint-disable-next-line vue/no-unused-properties
    saveTrigger: {
      type: Boolean,
      required: true,
    },

    // eslint-disable-next-line vue/no-unused-properties
    abortTrigger: {
      type: Boolean,
      required: true,
    },
  },

  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    changeHappend: (_flag: boolean) => true,
  },
});
</script>
