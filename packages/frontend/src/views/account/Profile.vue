<template>
  <Header :title="t('profile')" />

  <AppContent class="!px-4">
    <MenuItem
      :title="user?.name"
      :description="t('show_profile')"
      href="https://auth.geprog.com/auth/realms/bookyp/account/#/personal-info"
    >
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
      href="https://auth.geprog.com/auth/realms/bookyp/account/#/security/signingin"
      :title="t('change_password')"
    />

    <span class="text-xl pt-6">{{ t('support') }}</span>
    <MenuItem icon="person" :href="mailToGetHelp" :title="t('get_help')" />
    <MenuItem icon="person" :href="mailToGiveFeedback" :title="t('give_us_feedback')" />

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
