<template>
  <HomeHeader />
  <ProgressIndicator v-if="isLoading" />
  <div v-else-if="mapObjectsExists" class="flex flex-col flex-grow min-h-0">
    <SpaceMap v-if="spaceId">
      <FloorPlan :space-id="spaceId" />
      <MapObjects clickable mode="show-availability" :space-id="spaceId" @click-on-map-object="clickOnMapObject" />
    </SpaceMap>
  </div>
  <div v-else class="flex flex-col justify-center items-center flex-grow">
    <img src="/src/assets/img/no-map.svg?url" :alt="t('empty_map_desc')" class="max-w-70" />
    <p class="text-center font-bold mt-8">{{ t('empty_map') }}</p>
    <i18n-t v-if="isAdmin" keypath="admin_area_message" tag="p" class="text-center">
      <router-link :to="{ name: 'settings-space-map' }" class="underline">{{ t('admin_area') }}</router-link>
    </i18n-t>
  </div>

  <HomeActionButtons />
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import HomeHeader from '~/components/headers/HomeHeader.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import HomeActionButtons from '~/components/layout/toolbars/HomeActionButtons.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import FloorPlan from '~/components/space/map/FloorPlan.vue';
import MapObjects from '~/components/space/map/MapObjects.vue';
import SpaceMap from '~/components/space/map/SpaceMap.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import getMapObjects from '~/compositions/space/useMapObjects';
import { isSpaceAdmin } from '~/compositions/useAuthorization';

const { t } = useI18n();
const router = useRouter();
const { spaceId, currentSpace } = useCurrentSpace();

const isAdmin = ref(false);
const { data: mapObjectForCurrentSpace, isLoading } = getMapObjects(spaceId);

watch(
  currentSpace,
  async () => {
    if (currentSpace.value === undefined) {
      isAdmin.value = false;
      return;
    }
    isAdmin.value = await isSpaceAdmin(currentSpace.value);
  },
  { immediate: true },
);

const mapObjectsExists = computed(() => mapObjectForCurrentSpace.value.length !== 0);

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
