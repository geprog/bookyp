<template>
  <AppContent class="flex-col">
    <div class="flex flex-col items-center max-md:pt-6">
      <img src="~/assets/img/bookyp-new-logo.svg" class="h-17 w-29" alt="">

      <UAlert v-if="error" color="error" variant="soft" class="my-4" :title="t('oops')" :description="error" />

      <div class="flex items-center gap-8 p-4 text-sm">
        <FloatingButton icon="i-bookyp-log-in" :text="t('login')" data-test="login-button" @click="login(redirect)" />
        <FloatingButton icon="i-bookyp-signature" :text="t('sign_up')" @click="login(redirect)" />
      </div>
    </div>
  </AppContent>
</template>

<script setup lang="ts">
definePageMeta({ auth: 'unauthenticated-only' });

const { t } = useI18n();
const route = useRoute();
const { login } = useAuth();

useAppHeader(() => ({ menu: 'footer', title: t('login'), back: '/' }));

const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : '/'));
const error = computed(() => (typeof route.query.error === 'string' ? route.query.error : undefined));
</script>
