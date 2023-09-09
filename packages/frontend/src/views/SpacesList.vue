<template>
  <SpacesListHeader />
  <DesktopMenu />

  <ToolbarHeader action-for="spaces" />

  <AppContent class="flex-col">
    <Button
      v-if="allUnstableFeaturesEnabled && user"
      class="m-3 flex mt-10"
      :text="t('create_sample_space')"
      @click="createSampleSpace"
    />
    <div v-if="user && spaces.length > 0" class="flex flex-row justify-between px-3 overflow-x-auto scrollbar-hide">
      <template v-for="button in categoryButtons" :key="button.category">
        <FloatingButton
          class="w-25 mr-1"
          :is-selected="selectedCategory === button.category"
          :text="button.label"
          foreground-color="black"
          back-ground-color="gray"
          stroke
          @click="selectedCategory = button.category"
        />
      </template>
    </div>
    <ProgressIndicator v-if="isLoadingInvitations" />
    <template v-else-if="invitations.length > 0">
      <h2 class="m-3 font-bold">
        {{ t('invitation.pending_invitations') }}
      </h2>
      <ListItem
        v-for="invitation in invitations"
        :key="invitation._id"
        :description="t(`roles.${invitation.role}.name`)"
        :label="invitation.spaceName"
        class="m-3 relative"
      >
        <template #end>
          <IconButton icon="check-mark" @click="acceptInvitation(invitation._id)" />
          <IconButton icon="dismiss" @click="rejectInvitation(invitation._id)" />
        </template>
      </ListItem>

      <h2 class="m-3 font-bold">
        {{ t('spaces') }}
      </h2>
    </template>

    <router-link
      v-for="space in sortedSpaces"
      :key="space._id"
      class="flex flex-col sm:flex-row shadow-md rounded-md overflow-hidden m-3 relative"
      data-test="space-item"
      :to="{ name: 'space', params: { spaceId: space._id } }"
    >
      <div class="sm:min-w-1/2 sm:w-1/2">
        <img v-if="space.image" :src="space.image" class="h-32 md:h-full w-full object-cover aspect-video" />
        <SpaceMap
          v-else-if="space.floorPlan.length || hasMapObjects(space._id)"
          :disable-control="true"
          class="h-32 md:h-full w-full object-cover aspect-video"
        >
          <FloorPlan :space-id="space._id" />
          <MapObjects :space-id="space._id" mode="highlight" />
        </SpaceMap>
        <img
          v-else
          src="/src/assets/img/space-placeholder.svg?url"
          class="h-32 md:h-full w-full object-cover aspect-video"
        />
      </div>
      <div class="w-full p-4 flex flex-col overflow-hidden">
        <div class="w-full flex flex-row justify-between items-center">
          <span>{{ space.name }}</span>
          <IconButton
            v-if="isAuthenticated"
            :icon="space.starred ? 'star-filled' : 'star'"
            :icon-color="space.starred ? 'text-primary-normal' : ''"
            class="flex-shrink-0"
            @click.prevent="updateStarForSpace(space._id, !space.starred)"
          />
        </div>
        <span class="text-gray-500 overflow-hidden overflow-ellipsis line-clamp-3">{{ space.description }}</span>
      </div>
    </router-link>

    <div v-if="sortedSpaces.length === 0" class="w-full h-4/5 flex items-center justify-center">
      <span class="text-gray-400">{{ noSpaceMessage }}</span>
    </div>
  </AppContent>
  <FooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import FloatingButton from '~/components/buttons/FloatingButton.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import SpacesListHeader from '~/components/headers/SpacesListHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import DesktopMenu from '~/components/layout/DesktopMenu.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import ToolbarHeader from '~/components/layout/toolbars/ToolbarHeader.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import FloorPlan from '~/components/space/map/FloorPlan.vue';
import MapObjects from '~/components/space/map/MapObjects.vue';
import SpaceMap from '~/components/space/map/SpaceMap.vue';
import getMapObjects from '~/compositions/space/useMapObjects';
import { isAuthenticated, user } from '~/compositions/useAuthentication';
import { Category, useCategory } from '~/compositions/useCategories';
import { useDateFilter } from '~/compositions/useDateFilter';
import useFeathers from '~/compositions/useFeathers';
import { useFeatureFlags } from '~/compositions/useFeatureFlags';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const feathers = useFeathers();
const router = useRouter();

const { dateFilter } = useDateFilter();
const { data: spaces, isLoading: loadingSpaces } = useFind(
  'spaces',
  computed(() => ({
    paginate: false,
    query: {
      ...(dateFilter.value.start && dateFilter.value.end
        ? {
            $freeBookable: {
              start: dateFilter.value.start?.toISOString(),
              end: dateFilter.value.end?.toISOString(),
            },
          }
        : {}),
      $frequency: true,
      $isUserMember: true,
    },
  })),
);

const { selectedCategory } = useCategory();

const categoryButtons: { category: Category; label: string }[] = [
  { category: 'Frequent', label: t('space_list_categories.frequent') },
  { category: 'Favorite', label: t('space_list_categories.favorite') },
  { category: 'Personal', label: t('space_list_categories.personal') },
  { category: 'All', label: t('space_list_categories.all') },
];

const noSpaceMessage = computed(() => {
  let message = '';
  switch (selectedCategory.value) {
    case 'Personal':
      message = t('empty_space_list_message.personal');
      break;
    case 'Frequent':
      message = t('empty_space_list_message.frequent');
      break;
    case 'Favorite':
      message = t('empty_space_list_message.favorite');
      break;
    default:
      message = t('empty_space_list_message.all');
      break;
  }
  return message;
});

watch(
  loadingSpaces,
  () => {
    if (!loadingSpaces.value && spaces.value && user.value && !selectedCategory.value) {
      selectedCategory.value = spaces.value.some((space) => space.frequency)
        ? 'Frequent'
        : user.value?.starredSpaces?.length
        ? 'Favorite'
        : spaces.value.some((space) => space.isUserMember)
        ? 'Personal'
        : 'All';
    }
  },
  { immediate: true },
);

// sort spaces by name and starred
const sortedSpaces = computed(() => {
  const starredSpaces = user.value?.starredSpaces || [];

  return [...spaces.value]
    .map((space) => ({
      ...space,
      starred: user.value ? starredSpaces.includes(space._id) : undefined,
    }))
    .filter((space) => {
      if (user.value) {
        switch (selectedCategory.value) {
          case 'Personal':
            return space.isUserMember;
          case 'Favorite':
            return space.starred;
          case 'Frequent':
            return space.frequency !== undefined;
          case 'All':
            return true;
        }
      }
    })
    .sort((a, b) => {
      if (selectedCategory.value === 'Frequent') {
        const diff = (b.frequency || 0) - (a.frequency || 0);
        if (diff !== 0) {
          return diff;
        }
      }
      return a.name.localeCompare(b.name);
    });
});

const { data: invitations, isLoading: isLoadingInvitations } = useFind(
  'invitations',
  computed(() => (user.value === undefined ? null : { paginate: false, query: { email: user.value.email } })),
);

async function acceptInvitation(invitationId: string) {
  const invitation = await feathers.service('invitations').remove(invitationId, { query: { accept: true } });
  await router.replace({ name: 'space', params: { spaceId: invitation.spaceId } });
}

function rejectInvitation(invitationId: string) {
  void feathers.service('invitations').remove(invitationId);
}

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

function hasMapObjects(spaceId: string): boolean {
  return getMapObjects(ref<string>(spaceId)).data.value.length ? true : false;
}

const { allUnstableFeaturesEnabled } = useFeatureFlags();
const createSampleSpace = async (): Promise<void> => {
  if (!user.value) {
    throw new Error('A user must be authenticated before coming here');
  }

  const space = await feathers.service('spaces').create(
    new Model.Space({
      name: `Sample Space of ${new Date().toISOString()}`,
      address: 'test address\n test address 2\n test address 3',
      description: 'test description',
      members: [{ role: 'admin', userId: user.value?._id }],
      floorPlan: [
        'M1 1 L1 255',
        'M0 255 L30 255',
        'M30 255 L30 324',
        'M30 324 L287 324',
        'M287 324 L287 1',
        'M287 1 L1 1',
      ],
    }),
  );

  const bookable = await feathers
    .service('bookables')
    .create(new Model.Bookable({ name: 'test desk 1', space: space._id, description: 'desk of multiple uses' }));

  await feathers.service('mapObjects').create(
    new Model.MapObject({
      xPos: 0,
      yPos: 0,
      rotation: 180,
      paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
      type: 'table',
      space: space._id,
      link: { type: 'bookable', bookable: bookable._id },
    }),
  );

  await router.push({ name: 'space', params: { spaceId: space._id } });
};
</script>
