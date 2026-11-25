<template>
  <div class="mt-8 flex flex-col">
    <!-- the billing page (payment methods, billing details) is reachable before the first invoice exists -->
    <div class="mb-2 flex items-center">
      <span v-if="(invoices?.length ?? 0) > 0" class="text-xl">{{ t('invoices') }}</span>
      <NuxtLink :to="`/space/${spaceId}/settings/subscription/billing`" class="ml-auto text-sm text-amber-600 underline" data-test="edit-billing-details">
        {{ t('subscription.edit_billing_details') }}
      </NuxtLink>
    </div>
    <template v-if="(invoices?.length ?? 0) > 0">
      <div v-if="hasPending" class="mb-2 flex flex-wrap items-center gap-2 rounded-lg border-2 border-amber-600 p-2" data-test="invoices-pending">
        <span>{{ t('subscription.invoices_pending') }}</span>
        <AppButton class="ml-auto" outlined @click="navigateTo(`/space/${spaceId}/settings/subscription/billing`)">
          {{ t('subscription.edit_billing_details') }}
        </AppButton>
      </div>
      <ListItem v-for="invoice in invoices" :key="invoice._id" :status-color="invoice.status === 'issued' ? 'bg-emerald-600' : 'bg-primary'" class="mb-2" data-test="invoice-item">
        <div class="ml-3 flex w-full items-center gap-2">
          <span>{{ dayjs(invoice.date).format('DD.MM.YYYY') }}</span>
          <span class="text-sm text-gray-500">{{ invoice.number ?? '' }}</span>
          <span class="ml-auto">{{ amountToPrice(invoice.totalAmount, invoice.currency) }}</span>
          <AppButton v-if="invoice.status === 'issued'" :href="`/api/spaces/${spaceId}/invoices/${invoice._id}/pdf`" outlined class="ml-4">
            {{ t('pdf') }}
          </AppButton>
          <span v-else class="ml-4 text-sm text-gray-500">{{ t('subscription.invoice_pending') }}</span>
        </div>
      </ListItem>
    </template>
    <!-- invoices of v1 (gringotts) were not migrated, they are sent on request -->
    <i18n-t keypath="subscription.older_invoice" tag="p" class="text-sm text-gray-500" data-test="older-invoice">
      <template #email>
        <a :href="mailToOlderInvoice" class="underline">{{ contactEmail }}</a>
      </template>
    </i18n-t>
  </div>
</template>

<script setup lang="ts">
import type { Invoice } from '#shared/types/models';
import dayjs from 'dayjs';

const { t } = useI18n();
const { space, spaceId } = useCurrentSpace();
const { contactEmail } = useRuntimeConfig().public;

const { data: invoices } = usePolling(() => `invoices:${spaceId.value}`, () => $fetch<Invoice[]>(`/api/spaces/${spaceId.value}/invoices`), { watch: [spaceId], default: () => [] });

// other reasons (e.g. an error of the payment provider) need nothing from the customer
const hasPending = computed(() => invoices.value?.some(invoice => invoice.waitsForBillingDetails) ?? false);

const mailToOlderInvoice = computed(() =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(`${t('subscription.older_invoice_mail_subject')} [space: ${space.value.name}, ${spaceId.value}]`)}`,
);

function amountToPrice(amount: number, currency: string): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  return currency === 'EUR' ? `${rounded.toFixed(2)} €` : `${rounded} ${currency}`;
}
</script>
