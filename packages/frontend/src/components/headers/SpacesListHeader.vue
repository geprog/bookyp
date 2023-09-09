<template>
  <Header :title="t('search_spaces')">
    <template v-if="!user" #right>
      <router-link :to="{ name: 'auth-login' }" class="flex items-center gap-1">
        <span class="text-md">{{ $t('login_without_space') }}</span>
        <Icon name="log-in" />
      </router-link>
    </template>
  </Header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import { user } from '~/compositions/useAuthentication';

const { t } = useI18n();
</script>
