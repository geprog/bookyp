<template>
  <AppContent class="flex-col px-4!">
    <div class="flex items-center gap-3 rounded-md border-2 border-gray-200 p-4 text-center shadow-full">
      <div class="flex size-12 items-center justify-center rounded-full bg-gray-300">
        <UIcon name="i-bookyp-person" class="size-6" />
      </div>
      <span class="text-xl" data-test="user-name">{{ user?.name }}</span>
    </div>

    <MenuItem class="mt-4" icon="i-bookyp-location" to="/account/my-spaces" :title="t('my_spaces')" />
    <MenuItem icon="i-bookyp-person" :href="keycloakAccountUrl" :title="t('account_information')" />
    <MenuItem icon="i-bookyp-password" :href="`${keycloakAccountUrl}/#/security/signingin`" :title="t('change_password')" />
    <MenuItem icon="i-bookyp-language" to="/account/language" :title="t('language')" />

    <MenuItem class="border-t" icon="i-bookyp-help" :href="mailToGetHelp" :title="t('get_help')" />
    <MenuItem icon="i-bookyp-feedback" :href="mailToGiveFeedback" :title="t('give_us_feedback')" />

    <MenuItem icon="i-bookyp-text-checked" :href="t('landing_page.terms_and_conditions_url')" :title="t('terms_of_service')" />
    <MenuItem icon="i-bookyp-lock" :href="t('landing_page.privacy_policy_url')" :title="t('privacy_policy')" />
    <MenuItem icon="i-bookyp-delete" to="/account/delete" :title="t('delete_account')" />

    <div class="flex flex-row gap-2 border-t border-gray-500 py-4">
      <UIcon name="i-bookyp-logout" class="size-6" />
      <button class="text-left underline hover:text-amber-600" type="button" data-test="logout-button" @click="logout">
        {{ t('logout') }}
      </button>
    </div>

    <NuxtLink to="/features" class="flex cursor-default items-center justify-center gap-2 py-2 text-sm text-gray-500">
      <span class="text-sm">{{ t('version', { version }) }}</span>
    </NuxtLink>
  </AppContent>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';

const { t } = useI18n();
const { user, logout } = useAuth();
const { keycloakAccountUrl, contactEmail, buildDate } = useRuntimeConfig().public;

useAppHeader(() => ({ title: t('profile'), back: '/spaces' }));

// the build date is an ISO timestamp from CI, shown like in v1
const version = buildDate ? (dayjs(buildDate).isValid() ? dayjs(buildDate).format('DD.MM.YYYY HH:mm:ss') : buildDate) : 'dev';

function mailTo(subject: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}%20[user:${user.value?._id ?? ''}]&body=${encodeURIComponent(t('hey_bookyp_team'))},%20`;
}

const mailToGetHelp = computed(() => mailTo(t('mail_for_help')));
const mailToGiveFeedback = computed(() => mailTo(t('mail_for_feedback')));
</script>
