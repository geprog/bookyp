<template>
  <Teleport v-if="!loggedIn" to="#app-header-actions" defer>
    <button type="button" class="flex cursor-pointer items-center gap-1" data-test="login-button" @click="login()">
      <span class="text-base">{{ t('login_without_space') }}</span>
      <UIcon name="i-bookyp-log-in" class="size-6" />
    </button>
  </Teleport>

  <div ref="map" class="h-full w-full grow" />
  <ToolbarHeader selected="start" map-route="/spaces/map" list-route="/spaces" filter-route="/spaces/filter" :applied-filters="hasActiveFilter ? 1 : 0" />

  <div v-if="selectedSpace" class="fixed bottom-20 z-10 w-full">
    <NuxtLink :to="`/space/${selectedSpace._id}`" class="flex justify-center">
      <CardSmall class="mb-4 h-16 w-3/4 max-w-lg" :image-url="selectedSpace.imageUrl" :title="selectedSpace.name" :subtitle="selectedSpace.address">
        <IconButton
          v-if="loggedIn"
          :icon="isStarred(selectedSpace._id) ? 'star-filled' : 'star'"
          :icon-color="isStarred(selectedSpace._id) ? 'text-amber-500' : ''"
          class="mr-2 p-0"
          :label="t('star_space')"
          @click.prevent="toggleStar(selectedSpace!._id)"
        />
      </CardSmall>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { FeatureCollection, Point, Position } from 'geojson';

// one page instance for all selections, otherwise every marker click remounts the page and recreates the map
definePageMeta({ auth: 'ignored', key: 'spaces-map' });

const { t } = useI18n();
const route = useRoute();
const { loggedIn, login, isStarred, toggleStar } = useAuth();
const { dateFilter, hasActiveFilter } = useDateFilter();

useAppHeader(() => ({ title: t('search_spaces'), back: false }));

const { spaces } = useSpaces({ freeRange: dateFilter });

const selectedSpaceId = computed(() => (typeof route.params.selectedSpaceId === 'string' && route.params.selectedSpaceId) || undefined);
const selectedSpace = computed(() => spaces.value?.find(space => space._id === selectedSpaceId.value));

const geojson = computed<FeatureCollection>(() => ({
  type: 'FeatureCollection',
  features: (spaces.value ?? [])
    .filter(space => space.coordinates)
    .map(space => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [space.coordinates!.lng, space.coordinates!.lat] as Position },
      properties: { id: space._id },
    })),
}));

const map = ref<HTMLElement>();
useMap({
  selectedMarkerId: selectedSpaceId,
  geojson,
  clickable: true,
  container: map,
  clickHandler: (event, instance) => {
    const features = instance.getLayer('spaces') ? instance.queryRenderedFeatures(event.point, { layers: ['spaces'] }) : [];
    if (features.length === 0) {
      void navigateTo('/spaces/map', { replace: true });
      return { continueDefaultClickHandler: true };
    }
    const feature = features[0] as unknown as { geometry: Point; properties: { id: string } };
    if (feature.properties.id === selectedSpaceId.value) {
      return { continueDefaultClickHandler: true };
    }
    void navigateTo(`/spaces/map/${feature.properties.id}`, { replace: true });
    return { continueDefaultClickHandler: false };
  },
});
</script>
