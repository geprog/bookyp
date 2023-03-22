<template>
  <div v-if="customer">
    <LabelField icon-name="edit">
      <TextField
        :model-value="customer.name"
        :placeholder="t('subscription.customer.name')"
        required
        @update:model-value="updateCustomer('name', $event)"
      />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField
        :model-value="customer.email"
        :placeholder="t('subscription.customer.email')"
        @update:model-value="updateCustomer('email', $event)"
      />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField
        :model-value="customer.addressLine1"
        :placeholder="t('subscription.customer.address_line_1')"
        @update:model-value="updateCustomer('addressLine1', $event)"
      />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField
        :model-value="customer.addressLine2"
        :placeholder="t('subscription.customer.address_line_2')"
        @update:model-value="updateCustomer('addressLine2', $event)"
      />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField
        :model-value="customer.city"
        :placeholder="t('subscription.customer.city')"
        @update:model-value="updateCustomer('city', $event)"
      />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField
        :model-value="customer.zipCode"
        :placeholder="t('subscription.customer.zip_code')"
        @update:model-value="updateCustomer('zipCode', $event)"
      />
    </LabelField>
    <LabelField icon-name="document-one-page">
      <TextField
        :model-value="customer.country"
        :placeholder="t('subscription.customer.country')"
        @update:model-value="updateCustomer('country', $event)"
      />
    </LabelField>
  </div>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { useI18n } from 'vue-i18n';

import LabelField from '~/components/LabelField.vue';
import TextField from '~/components/TextField.vue';

const emit = defineEmits<{
  (event: 'update:customer', customer: Model.PaymentCustomer): void;
}>();

const props = defineProps<{
  customer?: Model.PaymentCustomer;
}>();

function updateCustomer<T extends keyof Model.PaymentCustomer>(key: T, value: Model.PaymentCustomer[T]) {
  if (props.customer) {
    emit('update:customer', { ...props.customer, [key]: value });
  }
}

const { t } = useI18n();
</script>
