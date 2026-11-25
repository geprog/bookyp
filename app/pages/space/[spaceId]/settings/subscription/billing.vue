<template>
  <AppContent class="flex-col">
    <Spinner v-if="!customer" />
    <div v-else class="my-4 flex flex-col gap-4">
      <div v-if="customer.exists">
        <span class="mb-2">{{ t('subscription.payment_method') }}</span>
        <PaymentMethodsForm v-model:selected="selectedPaymentMethod" @create="createPaymentMethod" @remove="deletePaymentMethod" />
      </div>
      <div>
        <span class="mb-2">{{ t('subscription.billing_details') }}</span>
        <PaymentCustomerForm v-model="customer" />
      </div>
      <AppButton :disabled="!isBillingComplete(customer)" :loading="saving" data-test="save-customer-button" class="mx-auto" @click="save">
        {{ t('subscription.save') }}
      </AppButton>
    </div>
  </AppContent>
</template>

<script setup lang="ts">
import type { PaymentCustomer } from '#shared/types/models';
import { isBillingComplete } from '#shared/utils/billing';

const { t, locale } = useI18n();
const { spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const toast = useAppToast();

useAppHeader(() => ({ title: t('subscription.edit_billing_details'), back: `/space/${spaceId.value}/settings/subscription` }));

const customer = ref<PaymentCustomer>();
const { data: loadedCustomer } = useApiData('payment-customer', () => $fetch<PaymentCustomer>('/api/payment/customer'));
watch(loadedCustomer, (value) => {
  if (value && !customer.value) {
    customer.value = { ...value };
  }
}, { immediate: true });

const { selectedPaymentMethod, changedPaymentMethod, createPaymentMethod, deletePaymentMethod } = usePaymentMethods(customer, saveCustomer);

const saving = ref(false);

async function saveCustomer(): Promise<boolean> {
  if (!customer.value) {
    return false;
  }
  try {
    customer.value = await api<PaymentCustomer>('/api/payment/customer', {
      method: 'PUT',
      body: {
        ...customer.value,
        language: customer.value.exists ? customer.value.language : locale.value,
        activePaymentMethod: changedPaymentMethod.value,
      },
    });
    return true;
  }
  catch (error) {
    showError(error);
    return false;
  }
}

async function save() {
  saving.value = true;
  try {
    if (await saveCustomer()) {
      toast.success(t('subscription.billing_details'));
      await navigateTo(`/space/${spaceId.value}/settings/subscription`);
    }
  }
  finally {
    saving.value = false;
  }
}
</script>
