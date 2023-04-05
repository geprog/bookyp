<template>
  <div
    class="flex flex-col p-4 sm:max-w-xl <sm:max-w-xs mx-auto border-2 shadow-full text-center rounded-md"
    :class="{
      'border-primary-dark ': active,
      'border-gray-300': !active,
    }"
  >
    <h2 v-if="plan === 'free'" class="font-bold">{{ t('subscription.free_plan') }}</h2>
    <h2 v-if="plan === 'enterprise'" class="font-bold">{{ t('subscription.enterprise_plan') }}</h2>
    <h2 v-if="plan === 'public'" class="font-bold">{{ t('subscription.public_plan') }}</h2>

    <div class="flex flex-col">
      <div>
        <span class="text-3xl">{{ spaceMembers }}</span>
        <span v-if="plan === 'free'" class="text-lg">{{ t('subscription.of_ten') }}</span>
        <span v-if="plan === 'enterprise' || plan === 'public'" class="text-lg">{{
          t('subscription.of_infinity')
        }}</span>
      </div>
      <span class="w-full">{{ t('subscription.members') }}</span>
    </div>

    <ul class="flex flex-col flex-grow items-start mt-8 text-left ml-4">
      <template v-if="plan === 'free'">
        <li>{{ t('subscription.features.private_space') }}</li>
        <li>{{ t('subscription.features.limited_users') }}</li>
        <li>{{ t('subscription.features.visible_invited') }}</li>
        <li>{{ t('subscription.features.map_editor') }}</li>
        <li>{{ t('subscription.features.unlimited_bookables') }}</li>
      </template>
      <template v-if="plan === 'enterprise'">
        <li>{{ t('subscription.features.private_space') }}</li>
        <li>{{ t('subscription.features.unlimited_users') }}</li>
        <li>{{ t('subscription.features.visible_invited') }}</li>
        <li>{{ t('subscription.features.map_editor') }}</li>
        <li>{{ t('subscription.features.unlimited_bookables') }}</li>
      </template>
      <template v-if="plan === 'public'">
        <li>{{ t('subscription.features.public_space') }}</li>
        <li>{{ t('subscription.features.unlimited_users') }}</li>
        <li>{{ t('subscription.features.visible_public') }}</li>
        <li>{{ t('subscription.features.map_editor') }}</li>
        <li>{{ t('subscription.features.unlimited_bookables') }}</li>
      </template>
    </ul>

    <span v-if="plan === 'free'" class="mt-4 uppercase">{{ t('subscription.free') }}</span>
    <span v-if="plan === 'enterprise'" class="mt-4 uppercase">{{
      t('subscription.price_per_member_per_month', { price: 1.5 })
    }}</span>
    <span v-if="plan === 'public'" class="mt-4 uppercase">{{ t('subscription.price_per_month', { price: 15 }) }}</span>

    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import { Model } from '@bookyp/core';
import { useI18n } from 'vue-i18n';

defineProps<{
  plan: Model.SpacePlan;
  active?: boolean;
  spaceMembers?: number;
}>();

const { t } = useI18n();
</script>

<style scoped>
ul li {
  list-style-type: '✓';
}
</style>
