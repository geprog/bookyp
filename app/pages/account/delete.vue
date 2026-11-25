<template>
  <AppContent class="flex-col px-4! max-md:pt-12">
    <span class="text-xl">{{ t('delete_account') }}</span>
    <span class="py-3 text-left">{{ t('delete_account_description') }}</span>
    <AppButton icon="delete" :href="mailToDeleteAccount">
      {{ t('delete_account') }}
    </AppButton>
  </AppContent>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { user } = useAuth();
const { contactEmail } = useRuntimeConfig().public;

useAppHeader(() => ({ menu: 'none', title: t('delete_account'), back: '/account' }));

const mailToDeleteAccount = computed(() =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(t('delete_data_request'))}%20[user:${user.value?._id ?? ''}]&body=${encodeURIComponent(t('delete_account_mail', { userId: user.value?._id }))},%20`,
);
</script>
