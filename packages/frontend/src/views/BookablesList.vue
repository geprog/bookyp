<template>
  <HomeHeader />

  <div v-if="sortedBookablesWithFilterMatched" class="w-full max-w-2xl mx-auto pb-25">
    <ListItem
      v-for="bookable in sortedBookablesWithFilterMatched"
      :key="bookable._id"
      :disabled="bookable.isFilterMatched === false"
      :label="bookable.name"
      :status-color="getBookableStatusColor(bookable.isFilterMatched)"
      :description="bookable.description"
      class="cursor-pointer m-3"
      @click="
        bookable.isFilterMatched && $router.push({ name: 'booking-create', params: { bookableId: bookable._id } })
      "
    />
  </div>

  <HomeActionsButtons />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import HomeHeader from '~/components/headers/HomeHeader.vue';
import HomeActionsButtons from '~/components/layout/toolbars/HomeActionButtons.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'BookablesList',

  components: { HomeHeader, HomeActionsButtons, ListItem },

  setup() {
    const { spaceId } = useCurrentSpace();

    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );
    const { bookablesWithFilterMatched } = useBookablesFilter(bookables);

    function getBookableStatusColor(isFilterMatched?: boolean): string {
      if (isFilterMatched === undefined) {
        return 'bg-primary-normal';
      }
      if (isFilterMatched) {
        return 'bg-green-text';
      }

      return 'bg-red-text';
    }

    const sortedBookablesWithFilterMatched = computed(() =>
      [...bookablesWithFilterMatched.value].sort((bookable) => (!bookable.isFilterMatched ? 1 : -1)),
    );

    return {
      sortedBookablesWithFilterMatched,
      getBookableStatusColor,
    };
  },
});
</script>
