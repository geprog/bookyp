<template>
  <Header :title="title" has-back>
    <slot name="actions">
      <div class="flex gap-x-2">
        <IconButton
          icon="map"
          :icon-color="$route.name === 'settings-space-map' ? 'text-primary-normal' : undefined"
          :aria-label="t('map_editor')"
          data-test="button-map-objects"
          @click="$router.replace({ name: 'settings-space-map' })"
        />
        <IconButton
          icon="apps-list"
          :icon-color="$route.name === 'settings-bookables' ? 'text-primary-normal' : undefined"
          :aria-label="t('bookables')"
          data-test="button-bookables"
          @click="$router.replace({ name: 'settings-bookables' })"
        />
        <IconButton
          icon="people"
          :icon-color="$route.name === 'settings-space-members' ? 'text-primary-normal' : undefined"
          :aria-label="t('members')"
          data-test="button-space-members"
          @click="$router.replace({ name: 'settings-space-members' })"
        />
        <IconButton
          icon="info"
          :icon-color="$route.name === 'settings-space-info' ? 'text-primary-normal' : undefined"
          :aria-label="t('space_information')"
          data-test="button-space-information"
          @click="$router.replace({ name: 'settings-space-info' })"
        />
        <IconButton
          v-if="allUnstableFeaturesEnabled"
          icon="credit-card"
          :icon-color="
            $route.name === 'space-settings-subscription' || $route.name === 'space-settings-subscription-customer'
              ? 'text-primary-normal'
              : undefined
          "
          :aria-label="t('subscription.space_subscription')"
          data-test="button-space-subscription"
          @click="$router.replace({ name: 'space-settings-subscription' })"
        />
      </div>
    </slot>
  </Header>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import { useFeatureFlags } from '~/compositions/useFeatureFlags';

defineProps<{
  title: string;
}>();

const { t } = useI18n();

const { allUnstableFeaturesEnabled } = useFeatureFlags();
</script>
