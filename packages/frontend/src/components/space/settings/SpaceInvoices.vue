<template>
  <div v-if="invoices.length > 0" class="flex flex-col mt-8">
    <span class="text-xl mb-2">{{ t('invoices') }}</span>
    <ListItem
      v-for="invoice in invoices"
      :key="invoice._id"
      :status-color="invoice.status === 'paid' ? 'bg-green-text' : 'bg-primary-normal'"
      class="mb-2"
    >
      <div class="flex w-full items-center gap-2 ml-3">
        <span>{{ dayjs(invoice.date).format('DD.MM.YYYY') }}</span>
        <span v-if="invoice.totalAmount !== undefined && invoice.currency" class="ml-auto">{{
          amountToPrice(invoice.totalAmount, invoice.currency)
        }}</span>
        <Button :text="$t('pdf')" outlined class="ml-4" @click="downloadInvoice(invoice)" />
      </div>
    </ListItem>
  </div>
</template>

<script setup lang="ts">
import { Model } from '@bookyp/core';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import ListItem from '~/components/list-items/ListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

const { t } = useI18n();
const feathers = useFeathers();

const { currentSpace: space } = useCurrentSpace();
const { data: _invoices } = useFind(
  'invoices',
  ref({
    query: {
      spaceId: space.value?._id,
    },
  }),
);
const invoices = computed(() => _invoices.value.filter((i) => i.status !== 'draft'));

function amountToPrice(amount: number, currency: string): string {
  const round = Math.round((amount + Number.EPSILON) * 100) / 100;
  switch (currency) {
    case 'EUR':
      return `${round.toFixed(2)} €`;
    default:
      return `${round} ${currency}`;
  }
}

async function downloadInvoice(invoice: Model.Invoice) {
  if (!invoice._id || !invoice.number) {
    throw new Error('Invoice has no id and no number');
  }

  const { url } = await feathers.service('invoice-download').get(invoice._id, { query: { spaceId: space.value?._id } });

  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoice.number}.pdf`;
  link.target = '_blank';
  link.dispatchEvent(new MouseEvent('click'));
}
</script>
