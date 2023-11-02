<template>
  <SettingsHeader :title="t('subscription.space_subscription')" />
  <AppContent class="flex-col">
    <div class="my-4">
      <h2 class="text-xl text-center">{{ t('subscription.plans') }}</h2>
      <div class="flex flex-wrap md:flex-nowrap gap-4 mt-4">
        <SpacePlanCard plan="free" :active="plan === 'free'" class="md:w-1/3">
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

        <SpacePlanCard plan="standard" :active="plan === 'standard'" class="md:w-1/3">
          <template #actions>
            <Button v-if="plan === 'standard'" :text="t('subscription.current_plan')" disabled />
            <Button
              v-else
              :text="t('subscription.upgrade')"
              :disabled="!!space?.requestedPlan"
              @click="changePlan('standard')"
            />
          </template>
        </SpacePlanCard>

        <SpacePlanCard plan="pro" :active="plan === 'pro'" class="md:w-1/3">
          <template #actions>
            <Button v-if="plan === 'pro'" :text="t('subscription.current_plan')" disabled />
            <Button
              v-else
              :text="t('subscription.upgrade')"
              :disabled="!!space?.requestedPlan"
              @click="changePlan('pro')"
            />
          </template>
        </SpacePlanCard>
      </div>

      <div v-if="space?.requestedPlan" class="text-center mt-8">
        {{ t('subscription.currently_upgrading_to_plan', { plan: space.requestedPlan }) }}
      </div>

      <SpaceInvoices />
    </div>

    <div
      v-if="user?.isSuperAdmin"
      class="flex flex-col p-4 mx-auto border-2 shadow-full text-center rounded-md border-gray-300 w-full"
    >
      <h2 class="text-xl font-bold">{{ t('super_admin') }}</h2>

      <form class="mt-4" @submit.prevent="updatePlan">
        <span class="text-left">{{ t('subscription_update_super_admin_description') }}</span>

        <LabelField icon-name="credit-card">
          <select v-model="spacePlanFormData.plan">
            <option value="free">{{ t('subscription.free_plan') }}</option>
            <option value="standard">{{ t('subscription.standard_plan') }}</option>
            <option value="pro">{{ t('subscription.pro_plan') }}</option>
          </select>
        </LabelField>

        <LabelField icon-name="clock">
          <DateTimePicker v-model="spacePlanFormData.activeUntil" />
        </LabelField>

        <Button class="mx-auto mt-2" :text="t('update_subscription')" type="submit" />
      </form>
    </div>
  </AppContent>
  <SpaceFooterMenu />
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

import Button from '~/components/buttons/Button.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import DateTimePicker from '~/components/inputs/DateTimePicker.vue';
import LabelField from '~/components/LabelField.vue';
import AppContent from '~/components/layout/AppContent.vue';
import SpaceFooterMenu from '~/components/layout/SpaceFooterMenu.vue';
import SpaceInvoices from '~/components/space/settings/SpaceInvoices.vue';
import SpacePlanCard from '~/components/space/settings/SpacePlanCard.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { user } from '~/compositions/useAuthentication';
import { openDialog } from '~/compositions/useDialog';
import useFeathers from '~/compositions/useFeathers';

const { t } = useI18n();
const router = useRouter();
const feathers = useFeathers();
const toast = useToast();

const { currentSpace: space } = useCurrentSpace();
const plan = computed(() => space.value?.plan);

const spacePlanFormData = reactive({
  activeUntil: space.value?.activeUntil,
  plan: space.value?.plan,
});

watch(space, () => {
  spacePlanFormData.plan = space.value?.plan;
  spacePlanFormData.activeUntil = space.value?.activeUntil;
});

async function changePlan(newPlan: Model.SpacePlan) {
  await router.push({
    name: 'space-settings-subscription-upgrade',
    params: {
      requestPlan: newPlan,
    },
  });
}

async function updatePlan() {
  if (!space.value) {
    throw new Error('No space loaded');
  }

  if (
    !(await openDialog({
      description: t('dangerous_super_admin_action_description'),
      label: t('dangerous_super_admin_action'),
      confirm: t('ok'),
    }))
  ) {
    return;
  }

  await feathers.service('spaces').patch(space.value?._id, spacePlanFormData);

  toast.success(t('updated_subscription'));
}
</script>
