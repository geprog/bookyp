<template>
  <Header :title="t('profile')" :back-fallback="{ name: 'spaces-list' }" />

  <AppContent class="!px-4 flex-col">
    <div class="flex items-center p-4 border-2 shadow-full text-center rounded-md gap-3 sm:max-w-3xl <sm:max-w-3xl">
      <div class="bg-gray-300 w-12 h-12 rounded-1/2 flex items-center">
        <Icon class="ml-3" name="person" />
      </div>
      <span class="text-xl">{{ user?.name }}</span>
    </div>

    <MenuItem
      class="flex mt-4"
      icon="person"
      href="https://auth.geprog.com/auth/realms/bookyp/account"
      :title="t('account_information')"
    />
    <MenuItem
      icon="password"
      href="https://auth.geprog.com/auth/realms/bookyp/account/#/security/signingin"
      :title="t('change_password')"
    />
    <MenuItem icon="language" :to="{ name: 'account-language' }" :title="t('language')" />

    <MenuItem class="border-t-1 border-gray-500 flex" icon="help" :href="mailToGetHelp" :title="t('get_help')" />
    <MenuItem icon="feedback" :href="mailToGiveFeedback" :title="t('give_us_feedback')" />

    <MenuItem icon="text-checked" href="https://bookyp.de/nutzungsbedingungen" :title="t('terms_of_service')" />
    <MenuItem icon="lock" href="https://bookyp.de/datenschutz" :title="t('privacy_policy')" />
    <div class="flex flex-row border-t-1 border-gray-500 py-4 gap-2">
      <Icon name="logout" />
      <button class="underline text-left hover:text-primary-dark" type="button" @click="logout">
        {{ t('logout') }}
      </button>
    </div>

    <router-link
      :to="{ name: 'features' }"
      class="cursor-default text-sm text-gray-500 gap-2 flex items-center justify-center py-2"
    >
      <span class="text-sm">{{ t('version', { version }) }}</span>
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
import { getConfig } from '~/config';

const { t } = useI18n();

const version = import.meta.env.VITE_BUILD_DATE;

const mailToGetHelp = `mailto:${getConfig().email}?subject=${encodeURIComponent(t('mail_for_help'))}%20[user:${
  user.value?._id || ''
}]&body=${encodeURIComponent(t('hey_bookyp_team'))},%20`;

const mailToGiveFeedback = `mailto:${getConfig().email}?subject=${encodeURIComponent(t('mail_for_feedback'))}%20[user:${
  user.value?._id || ''
}]&body=${encodeURIComponent(t('hey_bookyp_team'))},%20`;
</script>
