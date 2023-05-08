<template>
  <SettingsHeader :title="t('subscription.space_subscription')" />
  <AppContent>
    <div class="my-4">
      <h2 class="text-xl text-center">{{ t('subscription.plans') }}</h2>
      <div class="flex flex-wrap md:flex-nowrap gap-4 mt-4">
        <SpacePlanCard plan="free" :active="plan === 'free'" :space-members="spaceMembers.length" class="md:w-1/3">
          <template #actions>
            <Button v-if="plan === 'free'" :text="t('subscription.current_plan')" disabled />
            <Button
              v-else
              :text="t('subscription.downgrade')"
              :disabled="!!space?.requestedPlan"
              @click="changePlan('free')"
            />
          </template>
        </SpacePlanCard>

        <SpacePlanCard
          plan="enterprise"
          :active="plan === 'enterprise'"
          :space-members="spaceMembers.length"
          class="md:w-1/3"
        >
          <template #actions>
            <Button v-if="plan === 'enterprise'" :text="t('subscription.current_plan')" disabled />
            <Button
              v-else
              :text="t('subscription.upgrade')"
              :disabled="!!space?.requestedPlan"
              @click="changePlan('enterprise')"
            />
          </template>
        </SpacePlanCard>

        <SpacePlanCard plan="public" :active="plan === 'public'" :space-members="spaceMembers.length" class="md:w-1/3">
          <template #actions>
            <Button v-if="plan === 'public'" :text="t('subscription.current_plan')" disabled />
            <Button
              v-else
              :text="t('subscription.upgrade')"
              :disabled="!!space?.requestedPlan"
              @click="changePlan('public')"
            />
          </template>
        </SpacePlanCard>
      </div>

      <div v-if="space?.requestedPlan" class="text-center mt-8">
        {{ t('subscription.currently_upgrading_to_plan', { plan: space.requestedPlan }) }}
      </div>

      <SpaceInvoices />
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceInvoices from '~/components/space/settings/SpaceInvoices.vue';
import SpacePlanCard from '~/components/space/settings/SpacePlanCard.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';

const { t } = useI18n();
const router = useRouter();

const { currentSpace: space } = useCurrentSpace();
const spaceMembers = computed(() => space.value?.members || []);
const plan = computed(() => space.value?.plan || 'free');

async function changePlan(newPlan: Model.SpacePlan) {
  await router.push({
    name: 'space-settings-subscription-upgrade',
    params: {
      requestPlan: newPlan,
    },
  });
}
</script>
