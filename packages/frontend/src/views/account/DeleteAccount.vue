<template>
  <Header :title="t('delete_account')" :back-fallback="{ name: 'account' }" />

  <AppContent class="!px-4 flex-col <md:pt-12">
    <span class="text-xl">{{ t('delete_account') }}</span>
    <span class="py-3 text-left">{{ t('delete_account_description') }}</span>
    <Button icon="delete" :href="mailToDeleteAccount" :text="t('delete_account')" />
  </AppContent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import { user } from '~/compositions/useAuthentication';
import { getConfig } from '~/config';

const { t } = useI18n();

const mailToDeleteAccount = `mailto:${getConfig().email}?subject=${encodeURIComponent(
  t('delete_data_request'),
)}%20[user:${user.value?._id || ''}]&body=${encodeURIComponent(
  t('delete_account_mail', { userId: user.value?._id }),
)},%20`;
</script>
