<template>
  <Steps v-model:active-step="activeStep" class="mt-8">
    <Step>
      <h2 class="text-xl text-center">{{ t('subscription.plans') }}</h2>
      <div class="flex gap-4 mt-4">
        <!-- free plan -->
        <div
          class="w-1/3 flex flex-col p-4 sm:max-w-xl <sm:max-w-xs mx-auto border-2 shadow-full text-center rounded-md"
          :class="{
            'border-primary-dark ': plan === 'free',
            'border-gray-300': plan !== 'free',
          }"
        >
          <h2 class="font-bold">{{ t('subscription.free_plan') }}</h2>

          <div class="flex flex-col">
            <div>
              <span class="text-3xl">{{ spaceMembers.length }}</span>
              <span class="text-lg">{{ t('subscription.of_ten') }}</span>
            </div>
            <span class="w-full">{{ t('subscription.members') }}</span>
          </div>

          <div class="flex flex-col flex-grow items-start mt-8">
            <span>{{ t('subscription.features.map_editor') }}</span>
            <span>{{ t('subscription.features.unlimited_bookables') }}</span>
          </div>

          <span class="mt-4 uppercase">{{ t('subscription.free') }}</span>

          <Button v-if="plan === 'free'" :text="t('subscription.current_plan')" disabled />
          <Button
            v-else
            :text="t('subscription.downgrade')"
            :disabled="!!space?.requestedPlan"
            @click="changePlan('free')"
          />
        </div>

        <!-- enterprise plan -->
        <div
          class="w-1/3 flex flex-col p-4 sm:max-w-xl <sm:max-w-xs mx-auto border-2 shadow-full text-center rounded-md"
          :class="{
            'border-primary-dark ': plan === 'enterprise',
            'border-gray-300': plan !== 'enterprise',
          }"
        >
          <h2 class="font-bold">{{ t('subscription.enterprise_plan') }}</h2>

          <div :class="{ invisible: plan !== 'enterprise' }" class="flex flex-col">
            <div>
              <span class="text-3xl">{{ spaceMembers.length }}</span>
              <span class="text-lg">{{ t('subscription.of_infinity') }}</span>
            </div>
            <span class="w-full">{{ t('subscription.members') }}</span>
          </div>

          <div class="flex flex-col flex-grow items-start mt-8">
            <span>{{ t('subscription.features.everything_from_free') }}</span>
            <span>{{ t('subscription.features.unlimited_bookables') }}</span>
          </div>

          <span class="mt-4">{{ t('subscription.price_per_member_per_month', { price: 1.5 }) }}</span>

          <Button v-if="plan === 'enterprise'" :text="t('subscription.current_plan')" disabled />
          <Button
            v-else
            :text="t('subscription.upgrade')"
            :disabled="!!space?.requestedPlan"
            @click="changePlan('enterprise')"
          />
        </div>

        <!-- public plan -->
        <div
          class="w-1/3 flex flex-col p-4 sm:max-w-xl <sm:max-w-xs mx-auto border-2 shadow-full text-center rounded-md"
          :class="{
            'border-primary-dark ': plan === 'public',
            'border-gray-300': plan !== 'public',
          }"
        >
          <h2 class="font-bold">{{ t('subscription.public_plan') }}</h2>

          <div :class="{ invisible: plan !== 'public' }" class="flex flex-col">
            <div>
              <span class="text-3xl">{{ spaceMembers.length }}</span>
              <span class="text-lg">{{ t('subscription.of_infinity') }}</span>
            </div>
            <span class="w-full">{{ t('subscription.members') }}</span>
          </div>

          <div class="flex flex-col flex-grow items-start mt-8">
            <span>{{ t('subscription.features.everything_from_free') }}</span>
            <span>{{ t('subscription.features.unlimited_bookables') }}</span>
            <span>{{ t('subscription.features.space_listed_on_discover_page') }}</span>
          </div>

          <span class="mt-4">{{ t('subscription.price_per_month', { price: 15 }) }}</span>

          <Button v-if="plan === 'public'" :text="t('subscription.current_plan')" disabled />
          <Button
            v-else
            :text="t('subscription.upgrade')"
            :disabled="!!space?.requestedPlan"
            @click="changePlan('public')"
          />
        </div>
      </div>

      <div v-if="space?.requestedPlan" class="text-center mt-8">
        {{ t('subscription.currently_upgrading_to_plan', { plan: space.requestedPlan }) }}
      </div>

      <div class="flex mt-6 justify-between items-center">
        <router-link :to="{ name: 'space-settings-subscription-customer' }" replace>
          <Button :text="t('subscription.edit_customer')" />
        </router-link>
        <i18n-t scope="global" keypath="terms_and_conditions.using_bookyp" tag="p" class="text-sm">
          <a class="text-primary-normal underline" href="https://bookyp.de/nutzungsbedingungen" target="_blank">
            {{ t('terms_and_conditions.terms_and_conditions') }}
          </a>
        </i18n-t>
      </div>
    </Step>

    <Step>
      <div class="flex flex-col">
        <div class="text-xl mt-4 mx-auto">{{ t('subscription.edit_customer') }}</div>
        <PaymentCustomerForm @close="activeStep += 1" />
        <div class="flex justify-around mt-4">
          <Button :text="t('subscription.back')" @click="activeStep -= 1" />
          <Button
            type="submit"
            :text="hasActiveSubscription ? t('subscription.change_plan') : t('subscription.proceed_to_checkout')"
            form="payment-customer-form"
          />
        </div>
      </div>
    </Step>

    <Step>
      <div class="w-full flex flex-col mx-auto">
        <div class="mx-auto my-8">
          <p>{{ t('subscription.upgrade_to', { plan: requestPlan }) }}</p>
          <p>{{ t('subscription.estimated_price_for_new_plan', { estimatedPrice }) }}</p>
          <p v-if="!hasActiveSubscription">
            {{ t('subscription.payment_verification_description') }}
          </p>
        </div>
      </div>
      <div class="flex justify-around">
        <Button
          :text="t('subscription.back')"
          @click="
            () => {
              activeStep = 0;
              requestPlan = undefined;
            }
          "
        />
        <Button :text="t('subscription.proceed')" @click="checkOut" />
      </div>
    </Step>

    <Step>
      <div class="flex flex-col">
        <div class="mt-8 text-center">{{ t('subscription.upgrade_successful') }}</div>
        <Button
          class="mx-auto mt-4"
          :text="t('subscription.done')"
          @click="
            () => {
              activeStep = 0;
              requestPlan = undefined;
            }
          "
        />
      </div>
    </Step>
  </Steps>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import Step from '~/components/layout/Step.vue';
import Steps from '~/components/layout/Steps.vue';
import PaymentCustomerForm from '~/components/space/settings/PaymentCustomerForm.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';
import router from '~/router';

const { t } = useI18n();

const { currentSpace: space } = useCurrentSpace();
const spaceMembers = computed(() => space.value?.members || []);
const plan = computed(() => space.value?.plan || 'free');

const feathers = useFeathers();

const route = useRoute();
const activeStep = ref(route.query?.checkout ? 3 : 0);

const requestPlan = ref<Model.SpacePlan>();

function changePlan(newPlan: Model.SpacePlan) {
  requestPlan.value = newPlan;
  activeStep.value += 1;
}

const hasActiveSubscription = computed(() => space.value && !!space.value?.subscription);

// TODO: ask gringotts for forecast https://github.com/geprog/gringotts/issues/15
const estimatedPrice = computed(() => {
  if (requestPlan.value === 'public') {
    return 15;
  }
  if (requestPlan.value === 'enterprise') {
    return 1.5 * spaceMembers.value.length;
  }
  return undefined;
});

async function checkOut() {
  if (!requestPlan.value) {
    throw new Error('requestPlan should be set at this point');
  }

  const spaceId = space.value?._id;
  if (!spaceId) {
    throw new Error('No space id found');
  }

  const { checkoutUrl } = await feathers.service('spaceSubscriptions').patch(spaceId, { plan: requestPlan.value });
  if (checkoutUrl) {
    window.open(checkoutUrl, '_self');
  } else {
    activeStep.value += 1;
  }
}

onMounted(async () => {
  if (route.query?.checkout) {
    activeStep.value = 3;
    await router.replace({ name: 'space-settings-subscription' });
  }
});
</script>
