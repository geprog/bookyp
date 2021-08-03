<template>
  <HomeHeader />

  <div v-if="bookables" class="w-full max-w-2xl mx-auto">
    <ListItem
      v-for="bookable in bookables"
      :key="bookable._id"
      :label="bookable.name"
      status-color="bg-primary-normal"
      class="cursor-pointer m-3"
      :description="bookable.description"
      @click="$router.push({ name: 'booking-create', params: { bookableId: bookable._id } })"
    />
  </div>

  <ToggleBar
    class="absolute bottom-5 right-5"
    selected="end"
    start-icon="map"
    end-icon="list"
    @selected-start="$router.replace({ name: 'home' })"
  />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import HomeHeader from '~/components/headers/HomeHeader.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { spaceId } from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'BookablesLists',

  components: { ListItem, HomeHeader, ToggleBar },

  setup() {
    const { data: bookables } = useFind(
      'bookables',
      computed(() => ({ paginate: false, query: { space: spaceId.value } })),
    );

    return { bookables };
  },
});
</script>
