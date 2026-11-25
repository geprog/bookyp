<template>
  <UApp :locale="uiLocale">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UpdateApp />
  </UApp>
</template>

<script setup lang="ts">
import * as uiLocales from '@nuxt/ui/locale';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/de';

dayjs.extend(duration);

const toast = useAppToast();
const { locale } = useI18n();

const uiLocale = computed(() => (locale.value === 'de' ? uiLocales.de : uiLocales.en));

watch(locale, value => dayjs.locale(value), { immediate: true });

useHead({
  htmlAttrs: { lang: locale },
});

onErrorCaptured((error) => {
  console.error(error);
  toast.error(error.message);
});
</script>
