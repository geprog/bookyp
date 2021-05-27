<template>
  <HomeHeader />

  <div class="m-4 flex flex-col flex-grow">
    <svg class="w-full flex-grow" fill="none" xmlns="http://www.w3.org/2000/svg" data-test="space-map">
      <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
      <g
        v-for="mapObject in mapObjects"
        :key="mapObject._id"
        data-test="map-object"
        :transform="`translate(${mapObject.xPos},${mapObject.yPos})`"
      >
        <path v-for="path in mapObject.paths" :key="path" :d="path" class="stroke-black fill-white" />
      </g>
    </svg>
  </div>

  <ToggleBar
    class="absolute bottom-5 right-5"
    selected="start"
    start-icon="map"
    end-icon="list"
    @selected-end="$router.replace({ name: 'bookables-list' })"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import HomeHeader from '~/components/headers/HomeHeader.vue';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'BookablesMap',

  components: { HomeHeader, ToggleBar },

  setup() {
    const { data: spaces } = useFind('spaces');
    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });

    const { data: mapObjects } = useFind('mapObjects');

    return { floorPlan, mapObjects };
  },
});
</script>
