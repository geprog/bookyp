<template>
  <Header :title="t('bookyp')" :has-back="!!savedSpaceId">
    <Button v-if="!user" class="py-1 px-3" :text="t('sign_in')" @click="$router.push({ name: 'auth-login' })" />
    <IconButton v-else data-test="button-account" icon="person" @click="$router.push({ name: 'account-bookings' })" />
    <IconButton v-if="user" icon="sign-out" @click="logout" />
  </Header>

  <div ref="map" class="w-full h-full" />
  <div v-if="selectedSpace" class="fixed bottom-0 flex justify-center w-full">
    <router-link
      :to="{ name: selectedSpace.importId ? 'space-info' : 'space', params: { spaceId: selectedSpaceId } }"
      class="flex flex-row w-3/4 max-w-128 mb-4 p-4 bg-white rounded-md justify-between"
    >
      <div class="flex flex-col justify-between w-[calc(100%-2rem)]">
        <span class="truncate">{{ selectedSpace.name }}</span>
        <span class="truncate text-gray-500 text-sm h-5">{{ selectedSpace.description }}</span>
      </div>
      <IconButton
        :icon="isSpaceStarred ? 'star-filled' : 'star'"
        :icon-color="isSpaceStarred ? 'text-primary-normal' : ''"
        class="p-0"
        @click.prevent="selectedSpaceId && updateStarForSpace(selectedSpaceId, !isSpaceStarred)"
      />
    </router-link>
  </div>
  <SpacesActionButtons v-else />
</template>

<script lang="ts" setup>
// eslint-disable-next-line no-restricted-imports
import 'maplibre-gl/dist/maplibre-gl.css';

import { Model } from '@bookyp/core';
import type { FeatureCollection, Point, Position } from 'geojson';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import SpacesActionButtons from '~/components/layout/toolbars/SpacesActionButtons.vue';
import { savedSpaceId } from '~/compositions/space/useCurrentSpace';
import { logout, user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';
import { useMap } from '~/compositions/useMap';

const { t } = useI18n();
const router = useRouter();
const feathers = useFeathers();

const props = defineProps<{
  selectedSpaceId?: Model.Ref<Model.Space>;
}>();

const { data: spaces } = useFind(
  'spaces',
  computed(() => ({ paginate: false })),
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
