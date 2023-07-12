<template>
  <SpacesListHeader />

  <div ref="map" class="w-full h-full" />
  <div v-if="selectedSpace" class="fixed bottom-20 flex justify-center w-full">
    <router-link
      :to="{ name: 'space', params: { spaceId: selectedSpaceId } }"
      class="flex flex-row w-3/4 max-w-128 mb-4 p-4 bg-white rounded-md justify-between"
    >
      <div class="flex flex-col justify-between w-[calc(100%-2rem)]">
        <span class="truncate">{{ selectedSpace.name }}</span>
        <span class="truncate text-gray-500 text-sm h-5">{{ selectedSpace.description }}</span>
      </div>
      <IconButton
        v-if="isAuthenticated"
        :icon="isSpaceStarred ? 'star-filled' : 'star'"
        :icon-color="isSpaceStarred ? 'text-primary-normal' : ''"
        class="p-0"
        @click.prevent="selectedSpaceId && updateStarForSpace(selectedSpaceId, !isSpaceStarred)"
      />
    </router-link>
  </div>
  <SpacesActionButtons v-else />
  <FooterMenu />
</template>

<script lang="ts" setup>
// eslint-disable-next-line no-restricted-imports
import 'maplibre-gl/dist/maplibre-gl.css';

import { Model } from '@bookyp/core';
import type { FeatureCollection, Point, Position } from 'geojson';
import { computed, ref, toRef } from 'vue';
import { useRouter } from 'vue-router';

import IconButton from '~/components/buttons/IconButton.vue';
import SpacesListHeader from '~/components/headers/SpacesListHeader.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import SpacesActionButtons from '~/components/layout/toolbars/SpacesActionButtons.vue';
import { isAuthenticated, user } from '~/compositions/useAuthentication';
import { useDateFilter } from '~/compositions/useDateFilter';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import { useMap } from '~/compositions/useMap';

const router = useRouter();
const feathers = useFeathers();

const props = defineProps<{
  selectedSpaceId?: Model.Ref<Model.Space>;
}>();

const { dateFilter } = useDateFilter();
const { data: spaces } = useFind(
  'spaces',
  computed(() => ({
    paginate: false,
    query:
      dateFilter.value.start && dateFilter.value.end
        ? {
            $freeBookable: {
              start: dateFilter.value.start?.toISOString(),
              end: dateFilter.value.end?.toISOString(),
            },
          }
        : undefined,
  })),
);

const selectedSpaceId = toRef(props, 'selectedSpaceId');

const selectedSpace = computed(() => {
  if (!selectedSpaceId.value) {
    return undefined;
  }

  return spaces.value.find((space) => space._id === selectedSpaceId.value);
});

const isSpaceStarred = computed(() => {
  if (!selectedSpaceId.value) {
    return false;
  }

  return user.value?.starredSpaces?.includes(selectedSpaceId.value);
});

type Marker = {
  id: string;
};

const geojson = computed<FeatureCollection>(() => ({
  type: 'FeatureCollection',
  features: spaces.value
    .filter((space) => space.coordinates)
    .map((space) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [space.coordinates?.lng, space.coordinates?.lat] as Position,
      },
      properties: {
        id: space._id,
      },
    })),
}));

const map = ref<HTMLElement>();
useMap({
  selectedMarkerId: selectedSpaceId,
  geojson,
  clickHandler: (e) => {
    const features = e.target.queryRenderedFeatures(e.point, {
      layers: ['spaces'],
    });

    // Deselect marker when the map is clicked
    if (features.length === 0) {
      void router.replace({ name: 'spaces-map' });
      return { continueDefaultClickHandler: true };
    }

    const feature = features[0] as unknown as {
      geometry: Point;
      properties: Marker;
    };

    // Prevent reloading the same marker
    if (feature.properties.id === selectedSpaceId.value) {
      return { continueDefaultClickHandler: true };
    }

    void router.replace({ name: 'spaces-map', params: { selectedSpaceId: feature.properties.id } });
    return { continueDefaultClickHandler: false };
  },
  clickable: ref(true),
  container: map,
});

async function updateStarForSpace(_spaceId: string, starred: boolean) {
  if (user.value === undefined) {
    throw new Error('User is not logged in');
  }
  const userToUpdate = user.value;
  if (starred) {
    userToUpdate.starredSpaces = [...(userToUpdate.starredSpaces || []), _spaceId];
  } else {
    userToUpdate.starredSpaces = (userToUpdate.starredSpaces || []).filter((spaceId) => spaceId !== _spaceId);
  }
  await feathers.service('users').patch(userToUpdate._id, userToUpdate);
}
</script>
