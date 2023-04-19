<template>
  <Header :title="t('profile')" />

  <AppContent class="!px-4">
    <MenuItem :title="user?.name" description="Show profile" href="https://auth.geprog.com/auth/realms/bookyp/account">
      <template #icon>
        <div class="rounded-full bg-gray-300 p-4">
          <Icon name="person" />
        </div>
      </template>
    </MenuItem>

    <span class="text-xl pt-6">{{ t('settings') }}</span>
    <MenuItem
      icon="person"
      href="https://auth.geprog.com/auth/realms/bookyp/account"
      :title="t('account_information')"
    />
    <MenuItem
      icon="password"
      href="https://auth.geprog.com/auth/realms/bookyp/account/password"
      :title="t('change_password')"
    />

    <span class="text-xl pt-6">{{ t('legal') }}</span>
    <MenuItem icon="text-checked" href="https://bookyp.de/nutzungsbedingungen" :title="t('terms_of_service')" />
    <MenuItem icon="lock" href="https://bookyp.de/datenschutz" :title="t('privacy_policy')" />

    <button class="underline py-4 text-left hover:text-primary-dark" type="button" @click="logout">
      {{ t('logout') }}
    </button>
    <router-link
      :to="{ name: 'features' }"
      class="cursor-default text-sm border-t-1 border-gray-300 text-gray-500 py-4"
    >
      <span>{{ t('version', { version }) }}</span>
    </router-link>
  </AppContent>

  <FooterMenu />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import MenuItem from '~/components/menu/MenuItem.vue';
import { logout, user } from '~/compositions/useAuthentication';

const { t } = useI18n();

const version = import.meta.env.VITE_BUILD_DATE;
</script>
