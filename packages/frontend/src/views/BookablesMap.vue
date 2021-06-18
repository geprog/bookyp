<template>
  <HomeHeader />

  <div class="m-4 flex flex-col flex-grow">
    <SpaceMap data-test="space-map">
      <FloorPlan />
      <MapObjects clickable @click-on-map-object="openCreateBooking" />
    </SpaceMap>
  </div>

  <ToggleBar
    class="absolute bottom-5 right-5"
    selected="start"
    data-test="toggle-bar"
    start-icon="map"
    end-icon="list"
    @selected-end="$router.replace({ name: 'bookables-list' })"
  />
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import HomeHeader from '~/components/headers/HomeHeader.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';

export default defineComponent({
  name: 'BookablesMap',

  components: { HomeHeader, ToggleBar, SpaceMap, FloorPlan, MapObjects },

  setup() {
    const router = useRouter();

    async function openCreateBooking(mapObject: Model.MapObject) {
      if (mapObject.bookable) {
        await router.push({ name: 'booking-create', params: { bookableId: mapObject.bookable } });
      }
    }

    return { openCreateBooking };
  },
});
</script>
