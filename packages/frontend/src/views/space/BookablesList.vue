<template>
  <HomeHeader />

  <AppContent class="flex-col">
    <ProgressIndicator v-if="isLoading" />
    <div v-else-if="bookablesWithFilterMatched.length" class="pb-25">
      <h2 class="mt-6 font-bold">
        {{ t('available_bookables') }}
      </h2>
      <ListItem
        v-for="bookable in availableBookables"
        :key="bookable._id"
        :label="bookable.name"
        status-color="bg-green-text"
        :description="bookable.description"
        class="cursor-pointer my-3"
        @click="$router.push({ name: 'booking-create', params: { bookableId: bookable._id } })"
      />

      <h2 class="mt-6 font-bold">
        {{ t('occupied_bookables') }}
      </h2>
      <ListItem
        v-for="bookable in occupiedBookables"
        :key="bookable._id"
        :label="bookable.name"
        status-color="bg-red-text"
        :description="bookable.description"
        class="cursor-pointer my-3"
        :class="{
          'shadow-orange-glow border-1 border-primary-normal': isBookedByMe(bookable._id),
        }"
        @click="$router.push({ name: 'booking-create', params: { bookableId: bookable._id } })"
      />
    </div>
  </AppContent>
  <HomeActionsButtons />
  <FooterMenu />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import HomeHeader from '~/components/headers/HomeHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import HomeActionsButtons from '~/components/layout/toolbars/HomeActionButtons.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBookables } from '~/compositions/useBookables';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'BookablesList',

  components: { HomeHeader, HomeActionsButtons, ListItem, ProgressIndicator, AppContent, FooterMenu },

  setup() {
    const { t } = useI18n();

    const { spaceId } = useCurrentSpace();

    const { data: bookables, isLoading } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );
    const { bookablesWithFilterMatched, isBookedByMe } = useBookables(bookables);

    const availableBookables = computed(() =>
      bookablesWithFilterMatched.value.filter((bookable) => bookable.isFilterMatched),
    );

    const occupiedBookables = computed(() =>
      bookablesWithFilterMatched.value.filter((bookable) => !bookable.isFilterMatched),
    );

    return {
      t,
      bookablesWithFilterMatched,
      availableBookables,
      occupiedBookables,
      isBookedByMe,
      isLoading,
    };
  },
});
</script>
