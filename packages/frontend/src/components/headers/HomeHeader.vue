<template>
  <Header :title="title" has-logo>
    <template #start>
      <BookypIcon class="min-w-max" />
    </template>
    <template v-if="!isLoading">
      <IconButton icon="filter" @click="$router.push({ name: 'bookables-filter' })" />
      <IconButton data-test="button-account" icon="person" @click="$router.push({ name: 'account-bookings' })" />
      <IconButton data-test="spaces-button" icon="location" @click="$router.push({ name: 'spaces-list' })" />
      <IconButton
        v-show="isAdmin"
        data-test="button-settings"
        icon="settings"
        :aria-label="t('settings')"
        @click="$router.push({ name: 'settings-space-map-objects' })"
      />
    </template>
    <IconButton icon="sign-out" @click="logout" />
  </Header>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import BookypIcon from '~/assets/icons/bookyp.svg';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { logout, user } from '~/compositions/useAuthentication';

export default defineComponent({
  name: 'HomeHeader',

  components: {
    Header,
    IconButton,
    BookypIcon,
  },

  setup() {
    const { t } = useI18n();

    const { currentSpace, isLoading } = useCurrentSpace();
    const isAdmin = computed(() =>
      currentSpace.value?.members?.some((member) => member.userId === user.value?._id && member.role === 'admin'),
    );

    const title = computed(() => currentSpace.value?.name || t('bookyp').toUpperCase());

    return { t, logout, isAdmin, isLoading, title };
  },
});
</script>
