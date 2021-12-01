<template>
  <HomeHeader />
  <div v-if="bookablesWithFilterMatched" class="w-full max-w-2xl mx-auto">
    <ListItem
      v-for="bookable in bookablesWithFilterMatched"
      :key="bookable._id"
      :disabled="bookable.isFilterMatched === false"
      :label="bookable.name"
      :status-color="getBookableStatusColor(bookable.isFilterMatched)"
      :description="bookable.description"
      class="cursor-pointer m-3"
      @click="
        bookable.isFilterMatched !== false &&
          $router.push({ name: 'booking-create', params: { bookableId: bookable._id } })
      "
    />
  </div>

  <ToggleBar
    class="absolute bottom-5 right-5"
    selected="end"
    start-icon="map"
    end-icon="apps-list"
    @selected-start="$router.replace({ name: 'home' })"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import HomeHeader from '~/components/headers/HomeHeader.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'BookablesLists',

  components: { ListItem, HomeHeader, ToggleBar },

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

    return {
      bookablesWithFilterMatched,
      getBookableStatusColor,
    };
  },
});
</script>
