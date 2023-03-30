<template>
  <Header :title="$t('subscription.change_space_plan')">
    <template #start>
      <IconButton icon="arrow-left" @click="$router.replace({ name: 'space-settings-subscription' })" />
    </template>
  </Header>
  <AppContent>
    <template v-if="requestPlan && customer && customer._id !== 'ignore'">
      <div class="my-4">
        <div class="flex flex-wrap md:flex-nowrap w-full gap-8">
          <div class="flex flex-col md:w-2/3 gap-4">
            <div>
              <span class="mb-2">{{ t('subscription.payment_method') }}</span>
              <PaymentMethodsForm
                v-model:selected-payment-method="selectedPaymentMethod"
                @create-payment-method="createPaymentMethod"
                @delete-payment-method="deletePaymentMethod"
              />
            </div>

            <div>
              <span class="mb-2">{{ t('subscription.billing_details') }}</span>
              <PaymentCustomerForm v-model:customer="customer" />
            </div>
          </div>

          <div class="flex flex-col md:w-1/3 align-center">
            <span class="mx-auto md:m-0">{{ t('subscription.new_plan') }}</span>
            <SpacePlanCard :plan="requestPlan" :space-members="spaceMembers.length" />

            <div class="flex flex-col mt-8 pt-4 border-t-1">
              <div class="flex justify-between">
                <span class="font-bold">{{ t('subscription.estimated_total') }}:</span>
                <span>{{ t('subscription.price_per_month', { price: estimatedPrice }) }}</span>
              </div>
              <Button :text="t('subscription.upgrade')" :disabled="!isUpgradeValid" class="mt-4" :action="checkOut" />

              <i18n-t
                scope="global"
                keypath="terms_and_conditions.using_bookyp"
                tag="p"
                class="text-sm text-gray-400 text-center mt-2"
              >
                <a class="text-primary-normal underline" href="https://bookyp.de/nutzungsbedingungen" target="_blank">
                  {{ t('terms_and_conditions.terms_and_conditions') }}
                </a>
              </i18n-t>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="my-4 flex flex-col">
      <span class="text-center mb-2">{{ t('subscription.billing_details') }}</span>
      <PaymentCustomerForm v-model:customer="customer" />
      <Button
        :text="t('subscription.save')"
        :disabled="!customer?.name"
        class="mt-4 mx-auto"
        :action="createCustomer"
      />
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { openDialog } from 'vue3-promise-dialog';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Dialog from '~/components/Dialog.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import PaymentCustomerForm from '~/components/space/settings/PaymentCustomerForm.vue';
import PaymentMethodsForm from '~/components/space/settings/PaymentMethodsForm.vue';
import SpacePlanCard from '~/components/space/settings/SpacePlanCard.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';
import useGet from '~/compositions/useGet';

const { t } = useI18n();
const feathers = useFeathers();
const router = useRouter();

const props = defineProps<{
  requestPlan?: Model.SpacePlan;
}>();

const { currentSpace: space } = useCurrentSpace();
const spaceMembers = computed(() => space.value?.members || []);

const requestPlan = toRef(props, 'requestPlan');

const selectedPaymentMethod = ref<Model.PaymentMethod>();
const customer = ref<Model.PaymentCustomer>();
const { data: databaseCustomer } = useGet('paymentCustomers', ref('ignore'));
watch(databaseCustomer, (_customer) => {
  customer.value = _customer;
  selectedPaymentMethod.value = _customer?.activePaymentMethod;
});

const isUpgradeValid = computed(() => selectedPaymentMethod.value && requestPlan.value && customer.value?.name);

// TODO: ask gringotts for forecast https://github.com/geprog/gringotts/issues/15
const estimatedPrice = computed(() => {
  if (requestPlan.value === 'public') {
    return 15;
  }
  if (requestPlan.value === 'enterprise') {
    return 1.5 * spaceMembers.value.length;
  }
  if (requestPlan.value === 'free') {
    return 0;
  }
  return undefined;
});

async function createPaymentMethod() {
  if (!requestPlan.value) {
    throw new Error('requestPlan should be set at this point');
  }

  if (
    !(await openDialog(Dialog, {
      description: t('subscription.payment_verification_description'),
      label: t('subscription.payment_verification'),
      confirm: t('ok'),
    }))
  ) {
    return;
  }

  const { checkoutUrl } = await feathers.service('payment-methods').create(
    {},
    {
      query: {
        redirectUrl: window.location.href,
      },
    },
  );

  if (!checkoutUrl) {
    throw new Error('No checkoutUrl');
  }

  window.open(checkoutUrl, '_self');
}

async function deletePaymentMethod(paymentMethod: Model.PaymentMethod) {
  if (!paymentMethod || !paymentMethod._id) {
    throw new Error('paymentMethod should be set at this point');
  }

  if (
    !(await openDialog(Dialog, {
      description: t('delete_dialog_description', { objectLabel: t('subscription.payment_method') }),
      label: t('delete'),
      confirm: t('ok'),
    }))
  ) {
    return;
  }

  await feathers.service('payment-methods').remove(paymentMethod._id);
}

async function checkOut() {
  if (!requestPlan.value) {
    throw new Error('requestPlan should be set at this point');
  }

  if (!selectedPaymentMethod.value) {
    throw new Error('selectedPaymentMethod should be set at this point');
  }

  if (!customer.value) {
    throw new Error('customer should be set at this point');
  }

  customer.value.activePaymentMethod = selectedPaymentMethod.value;
  await feathers.service('paymentCustomers').patch('ignore', customer.value);

  const spaceId = space.value?._id;
  if (!spaceId) {
    throw new Error('No space id found');
  }

  await feathers.service('spaceSubscriptions').patch(spaceId, { plan: requestPlan.value });

  await router.replace({ name: 'space-settings-subscription' });
}

async function createCustomer() {
  if (!customer.value) {
    throw new Error('Customer should be defined');
  }

  await feathers.service('paymentCustomers').patch('ignore', customer.value);
  customer.value._id = 'generated-id';
}
</script>
