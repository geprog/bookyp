<template>
  <div
    class="flex flex-col p-4 w-full sm:max-w-xl <sm:max-w-xs mx-auto border-2 shadow-full text-center rounded-md"
    :class="{
      'border-primary-dark': active,
      'border-gray-300': !active,
    }"
  >
    <h2 class="font-bold">{{ titles[plan] }}</h2>

    <div class="flex mx-auto mt-2">
      <span class="">{{ t('subscription.euro') }}</span>
      <span class="text-4xl">{{ prices[plan] }}</span>
    </div>

    <div class="mt-4">
      <span>{{ descriptions[plan] }}</span>
    </div>

    <ul class="flex icon-plus flex-col flex-grow items-start mt-8 text-left ml-4">
      <li v-for="resource in resources[plan]" :key="resource" class="pl-1">{{ resource }}</li>
    </ul>

    <ul class="flex icon-checkmark flex-col flex-grow items-start mt-2 pt-2 border-t-1 border-gray-700 text-left pl-4">
      <li v-for="feature in features[plan]" :key="feature" class="pl-1">{{ feature }}</li>
    </ul>
    <Link href="https://bookyp.de/pricing" class="text-primary-dark mt-2 mx-auto">{{
      t('subscription.explorer_all_features')
    }}</Link>

    <div class="mt-12" />
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import { Model } from '@bookyp/core';
import { useI18n } from 'vue-i18n';

import Link from '~/components/buttons/Link.vue';

defineProps<{
  plan: Model.SpacePlan;
  active?: boolean;
}>();

const { t } = useI18n();

const prices = {
  free: 0,
  standard: 39,
  pro: 99,
};

const titles: Record<Model.SpacePlan, string> = {
  free: t('subscription.free_plan'),
  standard: t('subscription.standard_plan'),
  pro: t('subscription.pro_plan'),
};

const descriptions: Record<Model.SpacePlan, string> = {
  free: t('subscription.plans.descriptions.free'),
  standard: t('subscription.plans.descriptions.standard'),
  pro: t('subscription.plans.descriptions.pro'),
};

const resources: Record<Model.SpacePlan, string[]> = {
  free: [
    t('subscription.plans.resources.users', { x: 5 }),
    t('subscription.plans.resources.bookables', { x: 3 }),
    t('subscription.plans.resources.bookings', { x: 60 }),
  ],
  standard: [
    t('subscription.plans.resources.users', { x: 50 }),
    t('subscription.plans.resources.bookables', { x: 50 }),
    t('subscription.plans.resources.bookings', { x: t('subscription.plans.resources.unlimited') }),
  ],
  pro: [
    t('subscription.plans.resources.users', { x: 250 }),
    t('subscription.plans.resources.bookables', { x: 250 }),
    t('subscription.plans.resources.bookings', { x: t('subscription.plans.resources.unlimited') }),
  ],
};

const features: Record<Model.SpacePlan, string[]> = {
  free: [
    t('subscription.plans.features.free_forever'),
    t('subscription.plans.features.no_credit_card'),
    t('subscription.plans.features.start_at_a_glance'),
  ],
  standard: [
    t('subscription.plans.features.standard_email_support'),
    t('subscription.plans.features.start_at_a_glance'),
  ],
  pro: [
    t('subscription.plans.features.priority_email_support'),
    t('subscription.plans.features.request_new_features'),
    t('subscription.plans.features.start_at_a_glance'),
  ],
};
</script>

<style scoped>
ul.icon-plus li {
  list-style-type: '+ ';
}

ul.icon-checkmark li {
  list-style-type: '✓';
}
</style>
