<template>
  <HomeHeader />

  <AppContent>
    <div v-if="bookablesWithFilterMatched.length" class="pb-25">
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
        :disabled="true"
        :label="bookable.name"
        status-color="bg-red-text"
        :description="bookable.description"
        class="cursor-not-allowed my-3"
      />
    </div>
  </AppContent>
  <HomeActionsButtons />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import HomeHeader from '~/components/headers/HomeHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import HomeActionsButtons from '~/components/layout/toolbars/HomeActionButtons.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'BookablesList',

  components: { HomeHeader, HomeActionsButtons, ListItem, AppContent },

  setup() {
    const { t } = useI18n();

    const { spaceId } = useCurrentSpace();

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );
    const { bookablesWithFilterMatched } = useBookablesFilter(bookables);

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
    };
  },
});
</script>
