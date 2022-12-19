<template>
  <div class="flex flex-col h-full max-h-xl m-auto">
    <div class="mt-8 flex flex-col items-center">
      <img class="w-48 h-auto mt-4 ml-8" src="/src/assets/img/bookyp-logo.svg?url" />
    </div>

    <div v-if="hasError" class="my-auto flex flex-col items-center">
      <span class="mb-4 text-6xl text-red-500">{{ t('oops') }}</span>
      <span v-if="authenticationError" class="text-lg text-center">{{ authenticationError }}</span>
      <Button class="mt-4" :text="t('try_again')" @click="retryAuthentication" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FeathersError } from '@feathersjs/errors/lib';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import getFeathers from '~/compositions/useFeathers';

const { t } = useI18n();
const router = useRouter();
const feathers = getFeathers();
const hasError = ref(false);
const authenticationError = ref<string>();

onMounted(async () => {
  try {
    await feathers.reAuthenticate();
    const redirectAfterAuth = localStorage.getItem('bookyp.redirectAfterAuth');
    if (redirectAfterAuth) {
      localStorage.removeItem('bookyp.redirectAfterAuth');
      await router.push(redirectAfterAuth);
    } else {
      await router.push({ name: 'home' });
    }
  } catch (e) {
    hasError.value = true;
    if (e instanceof FeathersError) {
      authenticationError.value = e.message;
    }
    throw e;
  }
});

async function retryAuthentication() {
  await router.push({ name: 'auth-login' });
}
</script>
