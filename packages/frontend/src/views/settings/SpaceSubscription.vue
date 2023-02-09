<template>
  <SettingsHeader :title="t('subscription.space_subscription')" />
  <AppContent>
    <div v-if="$route.name === 'space-settings-subscription'" class="flex flex-col">
      <SpacePlan />
    </div>

    <div v-else class="flex flex-col">
      <PaymentCustomerForm @close="$router.replace({ name: 'space-settings-subscription' })" />
      <div class="flex mt-6 gap-4 justify-center">
        <router-link :to="{ name: 'space-settings-subscription' }" replace>
          <Button text="Cancel" />
        </router-link>
        <Button text="Save" type="submit" form="payment-customer-form" />
      </div>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import PaymentCustomerForm from '~/components/space/settings/PaymentCustomerForm.vue';
import SpacePlan from '~/components/space/settings/SpacePlan.vue';

const { t } = useI18n();
</script>
