<template>
  <Header :title="t('bookyp').toUpperCase()" has-logo>
    <template #start>
      <BookypIcon />
    </template>
    <IconButton icon="filter" @click="$router.push({ name: 'bookables-filter' })" />
    <IconButton icon="person" @click="$router.push({ name: 'account-bookings' })" />
    <IconButton icon="settings" @click="$router.push({ name: 'settings-space-map-objects' })" />
    <IconButton icon="logout" @click="logout" />
  </Header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import BookypIcon from '~/assets/icons/bookyp.svg';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import { logout } from '~/compositions/useAuthentication';

export default defineComponent({
  name: 'HomeHeader',

  components: {
    Header,
    IconButton,
    BookypIcon,
  },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();

    return { t, logout };
  },
});
</script>
