<template>
  <Spinner v-if="loading" />
  <div v-else class="flex flex-col">
    <div class="-mx-2 flex flex-wrap justify-between">
      <div v-for="method in methods" :key="method._id" class="w-full p-2 md:w-1/2">
        <SelectableListItem :label="method.name" :selected="selected === method._id" data-test="payment-method" @update:selected="emit('update:selected', method._id)">
          <template #end>
            <div class="flex items-center">
              <UIcon :name="method.type === 'creditcard' ? 'i-bookyp-credit-card' : 'i-bookyp-direct-debit'" :class="method.type === 'creditcard' ? 'size-4' : 'size-6'" />
              <IconButton v-if="(methods?.length ?? 0) > 1 && selected !== method._id" icon="delete" :label="t('delete')" class="ml-2" @click.stop="emit('remove', method)" />
            </div>
          </template>
        </SelectableListItem>
      </div>
      <div class="flex w-full p-2 md:w-1/2">
        <AppButton icon="add" data-test="add-payment-method" class="w-full" @click="emit('create')">
          {{ t('subscription.add_payment_method') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentMethod } from '#shared/types/models';

defineProps<{ selected?: string }>();
const emit = defineEmits<{ 'create': []; 'update:selected': [id: string]; 'remove': [method: PaymentMethod] }>();

const { t } = useI18n();

const { data: methods, loading } = usePolling('payment-methods', () => $fetch<PaymentMethod[]>('/api/payment/methods'), { default: () => [], interval: 30_000 });
</script>
