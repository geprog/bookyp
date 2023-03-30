<template>
  <Header :title="t('bookings')" :back-fallback="{ name: 'bookables-map' }">
    <IconButton
      icon="calendar"
      :icon-color="$route.name === 'space-bookings-calendar' ? 'text-primary-normal' : undefined"
      :aria-label="t('space_information')"
      data-test="btn-space-bookings-calendar"
      @click="$router.replace({ name: 'space-bookings-calendar' })"
    />
    <IconButton
      icon="apps-list"
      :icon-color="$route.name === 'space-bookings-members' ? 'text-primary-normal' : undefined"
      :aria-label="t('space_information')"
      data-test="btn-space-bookings-calendar"
      @click="$router.replace({ name: 'space-bookings-members' })"
    />
  </Header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';

const { t } = useI18n();
</script>
