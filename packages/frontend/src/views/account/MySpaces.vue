<template>
  <Header :title="t('my_spaces')" :back-fallback="{ name: 'profile' }" />

  <AppContent class="flex-col pb-10">
    <h2 class="m-3 font-bold h-6 text-lg">
      {{ t('spaces_admin') }}
    </h2>

    <router-link
      v-for="space in sortedSpaces"
      :key="space._id"
      class="flex flex-col sm:flex-row shadow-md rounded-md overflow-hidden m-3 relative"
      data-test="space-item"
      :to="{ name: 'space', params: { spaceId: space._id } }"
    >
      <div class="sm:min-w-1/2 sm:w-1/2">
        <img v-if="space.image" :src="space.image" class="h-32 md:h-full w-full object-cover aspect-video" />
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
    <div class="w-full fixed bottom-12 z-50 md:bottom-0 flex justify-center items-end space-x-8 mb-4">
      <FloatingButton icon="add" :text="t('space_create')" @click="$router.push({ name: 'space-create' })" />
    </div>
  </AppContent>
  <FooterMenu />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import { isAuthenticated, user } from '~/compositions/useAuthentication';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const feathers = useFeathers();

const { data: spaces } = useFind(
  'spaces',
  computed(() => ({
    paginate: false,
    query: {
      $isUserMember: true,
    },
  })),
);

const adminSpaces = computed(() =>
  spaces.value.filter(
    (space) =>
      space.isUserMember &&
      space.members.some((member) => member.userId === user.value?._id && member.role === 'admin'),
  ),
);

// sort spaces by name and starred
const sortedSpaces = computed(() => {
  const starredSpaces = user.value?.starredSpaces || [];
  return [...adminSpaces.value]
    .map((space) => ({
      ...space,
      starred: user.value ? starredSpaces.includes(space._id) : undefined,
    }))
    .sort((a, b) => {
      if (a.starred && !b.starred) {
        return -1;
      }
      if (!a.starred && b.starred) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
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
