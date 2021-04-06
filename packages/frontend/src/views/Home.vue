<template>
  <Header title="Home" has-back>
    <Icon name="settings" @click="router.push({ name: 'settings-bookables' })" />
  </Header>

  <div v-if="bookables">
    <ListItem
      v-for="bookable in bookables"
      :key="bookable._id"
      :label="bookable.name"
      status-color="bg-yellow-500"
      :description="bookable.description"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import Header from '~/components/Header.vue';
import Icon from '~/components/Icon.vue';
import ListItem from '~/components/ListItem.vue';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Home',
  components: { Header, ListItem, Icon },
  setup() {
    const router = useRouter();
    const { data: bookables } = useFind('bookables');

    return { router, bookables };
  },
});
</script>
