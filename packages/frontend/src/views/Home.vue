<template>
  <Header :title="t('bookyp').toUpperCase()" has-logo>
    <template #start>
      <BookypIcon />
    </template>
    <IconButton icon="person" @click="$router.push({ name: 'account-bookings' })" />
    <IconButton icon="settings" @click="$router.push({ name: 'settings-space' })" />
    <IconButton icon="logout" @click="logoutFunc" />
  </Header>

  <div v-if="bookables">
    <ListItem
      v-for="bookable in bookables"
      :key="bookable._id"
      :label="bookable.name"
      status-color="bg-primary-normal"
      class="cursor-pointer"
      :description="bookable.description"
      @click="$router.push({ name: 'booking-create', params: { bookableId: bookable._id } })"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import BookypIcon from '~/assets/icons/bookyp.svg';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/Header.vue';
import ListItem from '~/components/ListItem.vue';
import { logout } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Home',

  components: { Header, ListItem, IconButton, BookypIcon },

  setup() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const { data: bookables } = useFind('bookables');

    const logoutFunc = async () => {
      await logout();
      await router.push({ name: 'loading-screen' });
    };

    return { t, logoutFunc, bookables };
  },
});
</script>
