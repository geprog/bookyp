<template>
  <NuxtLink
    class="relative m-3 flex flex-col overflow-hidden rounded-md shadow-md sm:flex-row"
    data-test="space-item"
    :to="`/space/${space._id}`"
  >
    <div class="sm:w-1/2 sm:min-w-1/2">
      <img v-if="space.imageUrl" :src="space.imageUrl" class="aspect-video h-32 w-full object-cover md:h-full" alt="">
      <SpaceMap v-else-if="showMap && hasMap" disable-control class="aspect-video h-32 w-full object-cover md:h-full">
        <FloorPlan :floor-plan="space.floorPlan" />
        <MapObjects :space-id="space._id" mode="highlight" />
      </SpaceMap>
      <img v-else src="~/assets/img/space-placeholder.svg" class="aspect-video h-32 w-full object-cover md:h-full" alt="">
    </div>
    <div class="flex w-full flex-col overflow-hidden p-4">
      <div class="flex w-full flex-row items-center justify-between">
        <span data-test="label">{{ space.name }}</span>
        <IconButton
          v-if="loggedIn"
          :icon="starred ? 'star-filled' : 'star'"
          :icon-color="starred ? 'text-amber-500' : ''"
          class="shrink-0"
          :label="t('star_space')"
          data-test="star-button"
          @click.prevent="toggleStar(space._id)"
        />
      </div>
      <span class="line-clamp-3 overflow-hidden text-gray-500" data-test="description">{{ space.description }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AnySpace } from '~/composables/useSpaces';

const props = defineProps<{
  space: AnySpace;
  /** render the floor plan when there is no image */
  showMap?: boolean;
}>();

const { t } = useI18n();
const { loggedIn, isStarred, toggleStar } = useAuth();

const starred = computed(() => isStarred(props.space._id));

// spaces without a floor plan might still have map objects to show
const spaceId = computed(() => props.space._id);
const { mapObjects } = useMapObjects(computed(() => (props.showMap && props.space.floorPlan.length === 0 ? spaceId.value : null)));
const hasMap = computed(() => props.space.floorPlan.length > 0 || (mapObjects.value?.length ?? 0) > 0);
</script>
