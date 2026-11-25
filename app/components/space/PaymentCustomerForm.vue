<template>
  <div>
    <IconField icon="i-bookyp-edit" class="w-full">
      <select :value="modelValue.type" class="bg-transparent" data-test="customer-type" @change="update('type', ($event.target as HTMLSelectElement).value as BillingType)">
        <option value="business">
          {{ t('subscription.customer.business') }}
        </option>
        <option value="consumer">
          {{ t('subscription.customer.consumer') }}
        </option>
      </select>
    </IconField>
    <template v-if="modelValue.type === 'business'">
      <FormTextField :model-value="modelValue.organizationName" icon="i-bookyp-edit" :placeholder="t('subscription.customer.organization_name')" required data-test="customer-organization-name" @update:model-value="update('organizationName', $event)" />
      <FormTextField :model-value="modelValue.vatNumber" icon="i-bookyp-document-one-page" :placeholder="t('subscription.customer.vat_number')" data-test="customer-vat-number" @update:model-value="update('vatNumber', $event)" />
      <FormTextField :model-value="modelValue.organizationNumber" icon="i-bookyp-document-one-page" :placeholder="t('subscription.customer.organization_number')" data-test="customer-organization-number" @update:model-value="update('organizationNumber', $event)" />
      <span class="text-sm text-gray-500">{{ t('subscription.customer.vat_or_organization_number') }}</span>
    </template>
    <template v-else>
      <FormTextField :model-value="modelValue.givenName" icon="i-bookyp-edit" :placeholder="t('subscription.customer.given_name')" required data-test="customer-given-name" @update:model-value="update('givenName', $event)" />
      <FormTextField :model-value="modelValue.familyName" icon="i-bookyp-edit" :placeholder="t('subscription.customer.family_name')" required data-test="customer-family-name" @update:model-value="update('familyName', $event)" />
    </template>
    <FormTextField :model-value="modelValue.email" icon="i-bookyp-document-one-page" type="email" :placeholder="t('subscription.customer.email')" data-test="customer-email" @update:model-value="update('email', $event)" />
    <FormTextField :model-value="modelValue.addressLine1" icon="i-bookyp-document-one-page" :placeholder="t('subscription.customer.address_line_1')" required data-test="customer-address1" @update:model-value="update('addressLine1', $event)" />
    <FormTextField :model-value="modelValue.addressLine2" icon="i-bookyp-document-one-page" :placeholder="t('subscription.customer.address_line_2')" @update:model-value="update('addressLine2', $event)" />
    <FormTextField :model-value="modelValue.city" icon="i-bookyp-document-one-page" :placeholder="t('subscription.customer.city')" required data-test="customer-city" @update:model-value="update('city', $event)" />
    <FormTextField :model-value="modelValue.zipCode" icon="i-bookyp-document-one-page" :placeholder="t('subscription.customer.zip_code')" required data-test="customer-zip" @update:model-value="update('zipCode', $event)" />
    <IconField icon="i-bookyp-document-one-page" class="w-full">
      <select :value="modelValue.country" class="bg-transparent" data-test="customer-country" @change="update('country', ($event.target as HTMLSelectElement).value)">
        <option value="" disabled>
          {{ t('subscription.customer.country') }}
        </option>
        <option v-for="country in countries" :key="country.code" :value="country.code">
          {{ country.name }}
        </option>
      </select>
    </IconField>
  </div>
</template>

<script setup lang="ts">
import type { BillingType, PaymentCustomer } from '#shared/types/models';
import { billingCountries, countryName } from '#shared/utils/billing';

const props = defineProps<{ modelValue: PaymentCustomer }>();
const emit = defineEmits<{ 'update:modelValue': [value: PaymentCustomer] }>();

const { t, locale } = useI18n();

const countries = computed(() => billingCountries
  .map(code => ({ code, name: countryName(code, locale.value) }))
  .sort((a, b) => a.name.localeCompare(b.name, locale.value)));

function update<K extends keyof PaymentCustomer>(key: K, value: PaymentCustomer[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>
