<template>
  <ProgressIndicator v-if="isLoading" />
  <div v-else class="flex flex-col">
    <div class="flex flex-wrap justify-between -mx-2">
      <div v-for="paymentMethod in databasePaymentMethods" :key="paymentMethod._id" class="w-full md:w-1/2 p-2">
        <SelectableListItem
          :label="paymentMethod.name"
          :selected="selectedPaymentMethod?._id === paymentMethod._id"
          @update:selected="$emit('update:selected-payment-method', paymentMethod)"
        >
          <template #end>
            <div class="flex items-center">
              <Icon v-if="paymentMethod.type === 'credit_card'" name="credit-card" />
              <Icon v-else name="direct-debit" />
              <IconButton
                v-if="databasePaymentMethods.length > 1 && selectedPaymentMethod?._id !== paymentMethod._id"
                icon="delete"
                class="ml-2"
                @click.stop="databasePaymentMethods.length > 1 && $emit('delete-payment-method', paymentMethod)"
              />
            </div>
          </template>
        </SelectableListItem>
      </div>
      <div class="w-full md:w-1/2 p-2 flex">
        <Button
          :text="t('subscription.add_payment_method')"
          icon="plus"
          class="w-full"
          @click="$emit('create-payment-method')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Icon from '~/components/Icon.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import ProgressIndicator from '~/components/ProgressIndicator.vue';
import useFind from '~/compositions/useFind';

defineEmits<{
  (event: 'create-payment-method'): void;
  (event: 'update:selected-payment-method', selectedPaymentMethod: Model.PaymentMethod): void;
  (event: 'delete-payment-method', paymentMethod: Model.PaymentMethod): void;
}>();

defineProps<{
  selectedPaymentMethod?: Model.PaymentMethod;
}>();

const { t } = useI18n();

const { data: databasePaymentMethods, isLoading } = useFind('payment-methods');
</script>
