<template>
  <Header
    :title="t('search_spaces')"
    :back-fallback="savedSpaceId ? { name: 'space', params: { spaceId: savedSpaceId } } : undefined"
    :right-class="user ? 'hidden md:flex' : 'flex'"
  >
    <template #right>
      <template v-if="user">
        <IconButton
          data-test="button-account"
          icon="person"
          class="hidden md:block"
          @click="$router.push({ name: 'account-bookings' })"
        />
        <IconButton icon="sign-out" class="hidden md:block" @click="logout" />
      </template>

      <router-link v-else :to="{ name: 'auth-login' }" class="flex items-center gap-1">
        <span class="text-md">{{ $t('login_without_space') }}</span>
        <Icon name="log-in" />
      </router-link>
    </template>
  </Header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import { savedSpaceId } from '~/compositions/space/useCurrentSpace';
import { logout, user } from '~/compositions/useAuthentication';

const { t } = useI18n();
</script>
