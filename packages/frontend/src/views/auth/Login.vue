<template>
  <header class="z-10 fixed top-0 bg-white w-full h-14 shadow-md flex justify-center">
    <LoginHeader />
  </header>

  <AppContent class="flex-col">
    <div class="flex flex-col items-center <md:pt-6">
      <img src="/src/assets/img/bookyp-new-logo.svg?url" class="w-29 h-17" />

      <div class="flex items-center gap-8 text-sm p-4">
        <router-link :to="{ name: 'auth-login' }" class="text-black">
          <FloatingButton icon="log-in" text="Log in" back-ground-color="orange" @click="redirectToLogin" />
        </router-link>

        <router-link :to="{ name: 'auth-login' }" class="text-black">
          <FloatingButton icon="signature" text="Sign up" back-ground-color="orange" />
        </router-link>
      </div>
    </div>
  </AppContent>
  <FooterMenu />
</template>

<script lang="ts" setup>
import { getEnvConfig } from '@geprog/vite-plugin-env-config';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import LoginHeader from '~/components/headers/LoginHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';

function redirectToLogin() {
  window.location.href = `${getEnvConfig('FRONTEND_BACKEND_URL') || ''}/oauth/keycloak?redirect=auth/callback`;
}
</script>
