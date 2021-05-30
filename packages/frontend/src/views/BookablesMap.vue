<template>
  <HomeHeader />

  <div class="m-4 flex flex-col flex-grow">
    <SpaceMap data-test="space-map">
      <FloorPlan />
      <MapObjects />
    </SpaceMap>
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
import { defineComponent } from 'vue';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import HomeHeader from '~/components/headers/HomeHeader.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';

export default defineComponent({
  name: 'BookablesMap',

  components: { HomeHeader, ToggleBar, SpaceMap, FloorPlan, MapObjects },
});
</script>
