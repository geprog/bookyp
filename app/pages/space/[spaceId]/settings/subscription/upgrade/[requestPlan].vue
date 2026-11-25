<template>
  <AppContent class="flex-col">
    <Spinner v-if="!customer" />
    <template v-else-if="customer.exists">
      <div class="my-4">
        <div class="flex w-full flex-wrap gap-8 md:flex-nowrap">
          <div class="flex w-full flex-col gap-4 md:w-2/3">
            <!-- like v1 the payment method charged for the plan can be picked (a first month is paid in the checkout instead) -->
            <div v-if="!needsCheckout && requestPlan !== 'free'" data-test="upgrade-payment-methods">
              <span class="mb-2">{{ t('subscription.payment_method') }}</span>
              <PaymentMethodsForm v-model:selected="selectedPaymentMethod" @create="createPaymentMethod" @remove="deletePaymentMethod" />
            </div>
            <div>
              <span class="mb-2">{{ t('subscription.billing_details') }}</span>
              <PaymentCustomerForm v-model="customer" />
            </div>
          </div>

          <div class="flex w-full flex-col md:w-1/3">
            <span class="text-center md:m-0">{{ t('subscription.new_plan') }}</span>
            <SpacePlanCard :plan="requestPlan" />

            <div class="mt-8 flex flex-col border-t border-gray-200 pt-4">
              <div class="flex justify-between">
                <span class="font-bold">{{ t('subscription.estimated_total') }}:</span>
                <span>{{ t('subscription.price_per_month', { price: spacePlans[requestPlan].pricePerMonth }) }}</span>
              </div>
              <template v-if="paidPeriodEnd">
                <template v-if="spacePlans[requestPlan].pricePerMonth > spacePlans[space.plan].pricePerMonth">
                  <span class="mt-2 font-bold" data-test="due-today">{{ t('subscription.due_today', { price: proratedUpgradePrice(space.plan, requestPlan, paidPeriodEnd).toFixed(2) }) }}</span>
                  <span class="text-sm text-gray-500">{{ t('subscription.prorated_hint', { date: dayjs(paidPeriodEnd).format('DD.MM.YYYY') }) }}</span>
                </template>
                <span v-else-if="requestPlan !== space.plan" class="mt-2 text-sm text-gray-500" data-test="downgrade-hint">{{ t('subscription.downgrade_hint', { date: dayjs(paidPeriodEnd).format('DD.MM.YYYY') }) }}</span>
              </template>
              <span v-if="needsCheckout" class="mt-2 text-sm text-gray-500" data-test="checkout-hint">{{ t('subscription.checkout_hint') }}</span>
              <AppButton :disabled="!isValid" :loading="checkingOut" data-test="change-plan-button" class="w-full mt-4" @click="checkOut">
                {{ needsCheckout ? t('subscription.continue_to_payment') : t('subscription.change_plan') }}
              </AppButton>
              <i18n-t scope="global" keypath="terms_and_conditions.using_bookyp" tag="p" class="mt-2 text-center text-sm text-gray-400">
                <a class="text-amber-500 underline" :href="t('landing_page.terms_and_conditions_url')" target="_blank" rel="noopener noreferrer">{{ t('terms_and_conditions.terms_and_conditions') }}</a>
              </i18n-t>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="my-4 flex flex-col">
      <span class="mb-2 text-center">{{ t('subscription.billing_details') }}</span>
      <PaymentCustomerForm v-model="customer" />
      <AppButton :disabled="!isBillingComplete(customer)" :loading="saving" data-test="save-customer-button" class="mx-auto mt-4" @click="saveCustomer">
        {{ t('subscription.save') }}
      </AppButton>
    </div>
  </AppContent>
</template>

<script setup lang="ts">
import type { PaymentCustomer, SpacePlan, SpaceSubscription } from '#shared/types/models';
import dayjs from 'dayjs';
import { isBillingComplete } from '#shared/utils/billing';
import { getActivePlan, isSpacePlan, proratedUpgradePrice, spacePlans } from '#shared/utils/plans';

const { t, locale } = useI18n();
const route = useRoute();
const { space, spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { back } = useBack();

useAppHeader(() => ({ menu: 'none', title: t('subscription.change_space_plan'), back: `/space/${spaceId.value}/settings/subscription` }));

const requestPlan = computed<SpacePlan>(() => (isSpacePlan(route.params.requestPlan) ? route.params.requestPlan : 'free'));

/** end of the period the current plan is paid for (upgrades are charged pro rata, downgrades start afterwards) */
const paidPeriodEnd = computed(() => {
  const { plan, currentPeriodEnd } = space.value;
  if (plan === 'free' || !currentPeriodEnd || new Date(currentPeriodEnd) <= new Date() || getActivePlan(space.value) !== plan) {
    return undefined;
  }
  return currentPeriodEnd;
});

/** a paid plan without a running paid period starts with the payment of the first month in the checkout */
const needsCheckout = computed(() => requestPlan.value !== 'free' && !paidPeriodEnd.value);

const customer = ref<PaymentCustomer>();
const { data: loadedCustomer } = useApiData('payment-customer', () => $fetch<PaymentCustomer>('/api/payment/customer'));
watch(loadedCustomer, (value) => {
  if (value && !customer.value) {
    customer.value = { ...value };
  }
}, { immediate: true });

const { selectedPaymentMethod, changedPaymentMethod, createPaymentMethod, deletePaymentMethod } = usePaymentMethods(customer, saveCustomer);

const isValid = computed(() => !!customer.value && isBillingComplete(customer.value));
const saving = ref(false);
const checkingOut = ref(false);

async function saveCustomer(): Promise<boolean> {
  if (!customer.value) {
    return false;
  }
  saving.value = true;
  try {
    customer.value = await api<PaymentCustomer>('/api/payment/customer', {
      method: 'PUT',
      body: { ...customer.value, language: locale.value, activePaymentMethod: needsCheckout.value ? undefined : changedPaymentMethod.value },
    });
    return true;
  }
  catch (error) {
    showError(error);
    return false;
  }
  finally {
    saving.value = false;
  }
}

async function checkOut() {
  checkingOut.value = true;
  try {
    if (!(await saveCustomer())) {
      return;
    }
    const result = await api<SpaceSubscription & { checkoutUrl?: string }>(`/api/spaces/${spaceId.value}/subscription`, { method: 'PUT', body: { plan: requestPlan.value } });
    if (result.checkoutUrl) {
      window.location.assign(result.checkoutUrl);
      return;
    }
    await back(`/space/${spaceId.value}/settings/subscription`);
  }
  catch (error) {
    showError(error);
  }
  finally {
    checkingOut.value = false;
  }
}
</script>
