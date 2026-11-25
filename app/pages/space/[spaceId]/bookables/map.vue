<template>
  <ToolbarHeader
    selected="start"
    :map-route="`/space/${spaceId}/bookables/map`"
    :list-route="`/space/${spaceId}/bookables/list`"
    :filter-route="`/space/${spaceId}/bookables/filter`"
    :applied-filters="dateFilter.start ? 1 : 0"
  />
  <Spinner v-if="loading" />
  <div v-else-if="!isMapEmpty" class="flex min-h-0 grow flex-col pt-12">
    <SpaceMap>
      <FloorPlan :floor-plan="space.floorPlan" />
      <MapObjects
        :mode="space.bookingsAndRequests === 'only_info' ? 'highlight' : 'show-availability'"
        :space-id="spaceId"
        :is-admin="isAdmin"
        :clickable="space.bookingsAndRequests !== 'only_info'"
        @click-on-map-object="clickOnMapObject"
      />
    </SpaceMap>
  </div>
  <div v-else class="flex grow flex-col items-center justify-center">
    <img src="~/assets/img/no-map.svg" :alt="t('empty_map_desc')" class="max-w-70">
    <p class="mt-8 text-center font-bold">
      {{ t('empty_map') }}
    </p>
    <i18n-t v-if="isAdmin" keypath="admin_area_message" tag="p" class="text-center">
      <NuxtLink :to="`/space/${spaceId}/settings/map-editor`" class="underline">
        {{ t('admin_area') }}
      </NuxtLink>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import type { MapObject } from '#shared/types/models';

definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
const { space, spaceId, isAdmin } = useCurrentSpace();
const { dateFilter } = useDateFilter();
const { mapObjects, loading } = useMapObjects(spaceId);

useAppHeader(() => ({ title: space.value.name, back: '/spaces' }));

const isMapEmpty = computed(() => space.value.floorPlan.length === 0 && (mapObjects.value?.length ?? 0) === 0);

async function clickOnMapObject(mapObject: MapObject) {
  if (mapObject.link?.type === 'bookable') {
    await navigateTo(`/space/${spaceId.value}/bookable/${mapObject.link.bookable}/booking`);
    return;
  }
  if (mapObject.link?.type === 'url') {
    const url = parseLinkUrl(mapObject.link.url);
    if (!url) {
      return;
    }
    if (url.host === location.host) {
      await navigateTo(url.pathname + url.search + url.hash);
    }
    else {
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    }
  }
}

/** links stored by v1 were not validated and may lack the scheme, only http(s) links are opened */
function parseLinkUrl(value: string): URL | undefined {
  return parseWebUrl(value) ?? parseWebUrl(`https://${value}`);
}
</script>
