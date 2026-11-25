<template>
  <AppContent class="flex-col">
    <Spinner v-if="loading" />
    <template v-else>
      <div class="m-3">
        <AppButton v-if="canAddNewBookables" icon="add" data-test="button-add-bookable" :to="`/space/${spaceId}/settings/bookable/create`" class="w-full">
          {{ t('bookable_create').toLocaleUpperCase() }}
        </AppButton>
        <AppButton v-else icon="info" :to="`/space/${spaceId}/settings/subscription`" class="w-full">
          {{ t('subscription.max_bookables_reached') }}
        </AppButton>
      </div>
      <ListItem
        v-for="bookable in bookables"
        :key="bookable._id"
        :label="bookable.name"
        :description="bookable.description"
        class="m-3"
        data-test="bookable-item"
        :to="`/space/${spaceId}/settings/bookable/${bookable._id}`"
      />
    </template>
  </AppContent>
</template>

<script setup lang="ts">
import type { Bookable } from '#shared/types/models';
import { planLimits } from '#shared/utils/plans';

const { t } = useI18n();
const { spaceId } = useCurrentSpace();
const { activePlan } = useSubscriptionLimits(spaceId);

useAppHeader(() => ({ title: t('bookables'), back: `/space/${spaceId.value}/settings` }));

const { data: bookables, loading } = usePolling(() => `bookables:${spaceId.value}:active`, () => $fetch<Bookable[]>(`/api/spaces/${spaceId.value}/bookables`), { watch: [spaceId], default: () => [] });

const canAddNewBookables = computed(() => (bookables.value?.length ?? 0) < planLimits.bookables[activePlan.value]);
</script>
