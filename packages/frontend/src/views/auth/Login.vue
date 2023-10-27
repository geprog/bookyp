<template>
  <Header :title="t('login')" :back-fallback="{ name: 'home' }" />

  <AppContent class="flex-col">
    <div class="flex flex-col items-center <md:pt-6">
      <img src="/src/assets/img/bookyp-new-logo.svg?url" class="w-29 h-17" />

      <div class="flex items-center gap-8 text-sm p-4">
        <FloatingButton icon="log-in" :text="$t('login')" back-ground-color="orange" @click="login" />

        <FloatingButton icon="signature" :text="$t('sign_up')" back-ground-color="orange" @click="login" />
      </div>
    </div>
  </AppContent>

  <FooterMenu />
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import FooterMenu from '~/components/layout/FooterMenu.vue';
import { login } from '~/compositions/useAuthentication';

const { t } = useI18n();
</script>
