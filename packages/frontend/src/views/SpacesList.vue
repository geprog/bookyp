<template>
  <SpacesListHeader />

  <AppContent>
    <div class="m-3 flex gap-2">
      <Button
        :aria-label="t('space_create')"
        icon="add"
        :text="t('space_create').toLocaleUpperCase()"
        class="flex-grow"
        @click="$router.push({ name: 'space-create' })"
      />
      <Button
        v-if="allUnstableFeaturesEnabled && user"
        class="flex-grow"
        :text="t('create_sample_space')"
        @click="createSampleSpace"
      />
    </div>

    <template v-if="invitations.length > 0">
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
      class="flex flex-col sm:flex-row border-1 border-gray-200 rounded-md overflow-hidden m-3 relative"
      data-test="space-item"
      :to="{ name: 'space', params: { spaceId: space._id } }"
    >
      <div class="sm:min-w-1/2 sm:w-1/2">
        <img v-if="space.image" :src="space.image" class="w-full object-cover aspect-video" />
        <img v-else src="/src/assets/img/bookyp-logo-text.svg?url" class="w-full object-contain aspect-video p-2" />
      </div>
      <div class="w-full p-4 flex flex-col overflow-hidden">
        <div class="w-full flex flex-row justify-between">
          <span>{{ space.name }}</span>
          <IconButton
            v-if="isAuthenticated"
            :icon="space.starred ? 'star-filled' : 'star'"
            :icon-color="space.starred ? 'text-primary-normal' : ''"
            class="flex-shrink-0"
            @click.prevent="updateStarForSpace(space._id, !space.starred)"
          />
        </div>
        <span class="text-gray-500 overflow-hidden overflow-ellipsis line-clamp-5">{{ space.description }}</span>
      </div>
    </router-link>
  </AppContent>
  <SpacesActionButtons />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import SpacesListHeader from '~/components/headers/SpacesListHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpacesActionButtons from '~/components/layout/toolbars/SpacesActionButtons.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { isAuthenticated, user } from '~/compositions/useAuthentication';
import { useDateFilter } from '~/compositions/useDateFilter';
import useFeathers from '~/compositions/useFeathers';
import { useFeatureFlags } from '~/compositions/useFeatureFlags';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const feathers = useFeathers();
const router = useRouter();

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

// sort spaces by name and starred
const sortedSpaces = computed(() => {
  const starredSpaces = user.value?.starredSpaces || [];
  return [...spaces.value]
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

const { data: invitations } = useFind(
  'invitations',
  computed(() => (user.value === undefined ? null : { paginate: false, query: { email: user.value.email } })),
);

function acceptInvitation(invitationId: string) {
  void feathers.service('invitations').remove(invitationId, { query: { accept: true } });
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
