<template>
  <HomeHeader />

  <div class="flex flex-col flex-grow min-h-0">
    <SpaceMap>
      <FloorPlan />
      <MapObjects clickable consider-filter @click-on-map-object="openCreateBooking" />
    </SpaceMap>
  </div>

  <HomeActionButtons />
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import HomeHeader from '~/components/headers/HomeHeader.vue';
import HomeActionButtons from '~/components/layout/toolbars/HomeActionButtons.vue';
import FloorPlan from '~/components/space/FloorPlan.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import SpaceMap from '~/components/space/SpaceMap.vue';

export default defineComponent({
  name: 'BookablesMap',

  components: { HomeHeader, HomeActionButtons, FloorPlan, MapObjects, SpaceMap },

  setup() {
    const router = useRouter();

    async function openCreateBooking(bookableId: Model.MapObject['bookable']) {
      if (bookableId) {
        await router.push({ name: 'booking-create', params: { bookableId } });
      }
    }

    return {
      openCreateBooking,
    };
  },
});
</script>
