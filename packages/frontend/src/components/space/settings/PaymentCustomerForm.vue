<template>
  <form
    v-if="customer"
    id="payment-customer-form"
    class="mx-4 mx-auto w-full flex flex-col"
    @submit.prevent="saveCustomer"
  >
    <LabelField icon-name="edit">
      <TextField v-model="customer.name" :placeholder="t('subscription.customer.name')" />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField v-model="customer.email" :placeholder="t('subscription.customer.email')" />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField v-model="customer.addressLine1" :placeholder="t('subscription.customer.address_line_1')" />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField v-model="customer.addressLine2" :placeholder="t('subscription.customer.address_line_2')" />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField v-model="customer.city" :placeholder="t('subscription.customer.city')" />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField v-model="customer.zipCode" :placeholder="t('subscription.customer.zip_code')" />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField v-model="customer.country" :placeholder="t('subscription.customer.country')" />
    </LabelField>
  </form>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import LabelField from '~/components/LabelField.vue';
import TextField from '~/components/TextField.vue';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const { t } = useI18n();
const feathers = useFeathers();

const { data: databaseCustomer, isLoading } = useGet('paymentCustomers', ref('ignore'));

const customer = ref<Model.PaymentCustomer>();
watch(isLoading, () => {
  customer.value = databaseCustomer.value || {};
});

async function saveCustomer() {
  if (!customer.value) {
    return;
  }

  if (customer.value._id === 'ignore') {
    delete customer.value._id;
  }

  await feathers.service('paymentCustomers').patch('ignore', customer.value);
  emit('close');
}
</script>
