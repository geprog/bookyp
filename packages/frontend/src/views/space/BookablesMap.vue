<template>
  <HomeHeader />

  <div class="flex flex-col flex-grow min-h-0">
    <SpaceMap v-if="spaceId">
      <FloorPlan :space-id="spaceId" />
      <MapObjects clickable consider-filter :space-id="spaceId" @click-on-map-object="clickOnMapObject" />
    </SpaceMap>
  </div>

  <HomeActionButtons />
  <FooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { useRouter } from 'vue-router';

import HomeHeader from '~/components/headers/HomeHeader.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import HomeActionButtons from '~/components/layout/toolbars/HomeActionButtons.vue';
import FloorPlan from '~/components/space/map/FloorPlan.vue';
import MapObjects from '~/components/space/map/MapObjects.vue';
import SpaceMap from '~/components/space/map/SpaceMap.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const router = useRouter();

const { spaceId } = useCurrentSpace();

async function clickOnMapObject(mapObject: Model.MapObject) {
  if (mapObject.link && mapObject.link.type === 'bookable') {
    await router.push({ name: 'booking-create', params: { bookableId: mapObject.link.bookable } });
    return;
  }
  if (mapObject.link && mapObject.link.type === 'url') {
    const url = new URL(mapObject.link.url);
    if (url.host === location.host) {
      await router.push(url.pathname + url.search + url.hash);
    } else {
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    }
  }
}
</script>
