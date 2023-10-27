<template>
  <Header :title="t('search_spaces')">
    <template v-if="!user" #right>
      <div class="flex items-center gap-1 cursor-pointer" @click="login">
        <span class="text-md">{{ $t('login_without_space') }}</span>
        <Icon name="log-in" />
      </div>
    </template>
  </Header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import { login, user } from '~/compositions/useAuthentication';

const { t } = useI18n();
</script>
