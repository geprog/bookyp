<template>
  <Header :title="title" :back-fallback="{ name: 'spaces-list' }" />

  <DesktopMenu />
  <ToolbarHeader action-for="bookables" />
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
        :status-color="isRequested(bookable._id) ? 'bg-primary-normal' : 'bg-red-text'"
        :description="bookable.description"
        class="cursor-pointer my-3"
        :class="getBorderStyle(bookable._id)"
        @click="$router.push({ name: 'booking-create', params: { bookableId: bookable._id } })"
      />
    </div>
  </AppContent>
  <FooterMenu />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import DesktopMenu from '~/components/layout/DesktopMenu.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import ToolbarHeader from '~/components/layout/toolbars/ToolbarHeader.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBookables } from '~/compositions/useBookables';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'BookablesList',

  components: {
    Header,
    ListItem,
    ProgressIndicator,
    AppContent,
    FooterMenu,
    ToolbarHeader,
    DesktopMenu,
  },

  setup() {
    const { t } = useI18n();

    const { spaceId, currentSpace } = useCurrentSpace();

    const { data: bookables, isLoading } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );
    const { bookablesWithFilterMatched, isBookedByMe, isRequested, isRequestedByMe } = useBookables(bookables);

    const availableBookables = computed(() =>
      bookablesWithFilterMatched.value.filter((bookable) => bookable.isFilterMatched),
    );

    const occupiedBookables = computed(() =>
      bookablesWithFilterMatched.value.filter((bookable) => !bookable.isFilterMatched),
    );

    function getBorderStyle(bookableID: string | undefined) {
      if (isRequestedByMe(bookableID)) {
        return `shadow-orange-glow border-2 border-primary-normal`;
      }
      if (isBookedByMe(bookableID)) {
        return `shadow-orange-glow border-1 border-primary-normal`;
      }
      return undefined;
    }

    const title = computed(() => currentSpace.value?.name || t('bookyp').toUpperCase());

    return {
      t,
      title,
      bookablesWithFilterMatched,
      availableBookables,
      occupiedBookables,
      getBorderStyle,
      isLoading,
      isRequested,
    };
  },
});
</script>
