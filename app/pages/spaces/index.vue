<template>
  <Teleport v-if="!loggedIn" to="#app-header-actions" defer>
    <button type="button" class="flex cursor-pointer items-center gap-1" data-test="login-button" @click="login()">
      <span class="text-base">{{ t('login_without_space') }}</span>
      <UIcon name="i-bookyp-log-in" class="size-6" />
    </button>
  </Teleport>

  <ToolbarHeader selected="end" map-route="/spaces/map" list-route="/spaces" filter-route="/spaces/filter" :applied-filters="hasActiveFilter ? 1 : 0" />

  <AppContent class="pt-10">
    <AppButton v-if="allUnstableFeaturesEnabled && loggedIn" class="m-3 flex" :text="t('create_sample_space')" @click="createSampleSpace" />

    <div v-if="loggedIn && (spaces?.length ?? 0) > 0" class="flex flex-row justify-between overflow-x-auto px-3 scrollbar-hide">
      <FloatingButton
        v-for="button in categoryButtons"
        :key="button.category"
        class="mr-1 w-25"
        :is-selected="selectedCategory === button.category"
        :text="button.label"
        foreground-color="black"
        stroke
        :data-test="`category-${button.category}`"
        @click="selectedCategory = button.category"
      />
    </div>

    <template v-if="invitations && invitations.length > 0">
      <h2 class="m-3 font-bold">
        {{ t('invitation.pending_invitations') }}
      </h2>
      <ListItem
        v-for="invitation in invitations"
        :key="invitation._id"
        :description="t(`roles.${invitation.role}.name`)"
        :label="invitation.spaceName"
        class="relative m-3"
        data-test="invitation-item"
      >
        <template #end>
          <IconButton icon="check-mark" :label="t('accept')" data-test="accept-invitation" @click="acceptInvitation(invitation._id)" />
          <IconButton icon="dismiss" :label="t('reject')" data-test="reject-invitation" @click="rejectInvitation(invitation._id)" />
        </template>
      </ListItem>
      <h2 class="m-3 font-bold">
        {{ t('spaces') }}
      </h2>
    </template>

    <SpaceCard v-for="space in sortedSpaces" :key="space._id" :space="space" show-map />

    <div v-if="!loading && sortedSpaces.length === 0" class="flex h-2/5 w-full items-center justify-center">
      <span class="text-gray-400">{{ noSpaceMessage }}</span>
    </div>
    <div v-if="loading && sortedSpaces.length === 0" class="flex h-2/5 w-full flex-col items-center justify-center">
      <Spinner />
      <span class="text-gray-400">{{ t('loading_space') }}</span>
    </div>
  </AppContent>
</template>

<script setup lang="ts">
import type { Bookable, Invitation, Space } from '#shared/types/models';
import { sampleFloorPlan } from '~/utils/sampleSpace';

definePageMeta({ auth: 'ignored' });

const { t } = useI18n();
const { user, loggedIn, login, isStarred } = useAuth();
const { api, showError } = useApi();
const { dateFilter, hasActiveFilter } = useDateFilter();
const { recentlyViewedSpaces } = useSavedSpace();
const { allUnstableFeaturesEnabled } = useFeatureFlags();

useAppHeader(() => ({ title: t('search_spaces'), back: false }));

const { spaces, loading } = useSpaces({ withFrequency: true, freeRange: dateFilter });

type Category = 'frequent' | 'favorite' | 'personal' | 'all';
const selectedCategory = useLocalStorage<Category>('bookyp.space-list-category', 'all');

const categoryButtons = computed(() => [
  { category: 'frequent' as const, label: t('space_list_categories.frequent') },
  { category: 'favorite' as const, label: t('space_list_categories.favorite') },
  { category: 'personal' as const, label: t('space_list_categories.personal') },
  { category: 'all' as const, label: t('space_list_categories.all') },
]);

const noSpaceMessage = computed(() => t(`empty_space_list_message.${selectedCategory.value}`));

const sortedSpaces = computed(() =>
  (spaces.value ?? [])
    .map(space => ({
      ...space,
      starred: loggedIn.value ? isStarred(space._id) : false,
      lastAccessedAt: recentlyViewedSpaces.value[space._id] ?? 0,
    }))
    .filter((space) => {
      if (!loggedIn.value) {
        return true;
      }
      switch (selectedCategory.value) {
        case 'personal':
          return !!space.role;
        case 'favorite':
          return space.starred;
        case 'frequent':
          return space.frequency !== undefined;
        default:
          return true;
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .sort((a, b) => (a.starred === b.starred ? 0 : a.starred ? -1 : 1))
    .sort((a, b) => b.lastAccessedAt - a.lastAccessedAt),
);

// like v1 an empty category falls back to a broader one once after the spaces are loaded,
// a category the user picks afterwards stays selected (and shows the empty message)
const categoryChecked = ref(false);
watch(loading, (value) => {
  if (value || categoryChecked.value || (spaces.value?.length ?? 0) === 0) {
    return;
  }
  categoryChecked.value = true;
  const fallback: Record<Category, Category> = { frequent: 'favorite', favorite: 'personal', personal: 'all', all: 'all' };
  while (sortedSpaces.value.length === 0 && selectedCategory.value !== 'all') {
    selectedCategory.value = fallback[selectedCategory.value];
  }
}, { immediate: true });

const { data: invitations } = usePolling(
  'my-invitations',
  async () => (user.value ? await $fetch<Invitation[]>('/api/invitations') : []),
  { watch: [user], default: () => [] },
);

async function acceptInvitation(invitationId: string) {
  try {
    const { spaceId } = await api<{ spaceId: string }>(`/api/invitations/${invitationId}/accept`, { method: 'POST' });
    await navigateTo(`/space/${spaceId}`, { replace: true });
  }
  catch (error) {
    showError(error);
  }
}

async function rejectInvitation(invitationId: string) {
  try {
    await api(`/api/invitations/${invitationId}/reject`, { method: 'POST' });
  }
  catch (error) {
    showError(error);
  }
}

async function createSampleSpace() {
  try {
    const space = await api<Space>('/api/spaces', {
      method: 'POST',
      body: {
        name: `Sample Space of ${new Date().toISOString()}`,
        address: 'test address\n test address 2\n test address 3',
        description: 'test description',
        floorPlan: sampleFloorPlan,
      },
    });
    const bookable = await api<Bookable>(`/api/spaces/${space._id}/bookables`, {
      method: 'POST',
      body: { name: 'test desk 1', description: 'desk of multiple uses' },
    });
    await api(`/api/spaces/${space._id}/map-objects`, {
      method: 'PUT',
      body: {
        mapObjects: [{
          xPos: 0,
          yPos: 0,
          rotation: 180,
          paths: ['M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z', 'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z'],
          type: 'table',
          link: { type: 'bookable', bookable: bookable._id },
        }],
      },
    });
    await navigateTo(`/space/${space._id}`);
  }
  catch (error) {
    showError(error);
  }
}
</script>
