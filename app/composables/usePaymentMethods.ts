import type { PaymentCustomer, PaymentMethod } from '#shared/types/models';

/**
 * Selecting, adding and removing the payment method of the current user (billing page and plan upgrade).
 * `saveCustomer` stores the billing details before a new payment method is created.
 */
export function usePaymentMethods(customer: Ref<PaymentCustomer | undefined>, saveCustomer: () => Promise<boolean>) {
  const { t } = useI18n();
  const { api, showError } = useApi();
  const { openDialog } = useDialog();

  const selectedPaymentMethod = ref<string>();
  watch(() => customer.value?.activePaymentMethod, (value) => {
    if (!selectedPaymentMethod.value) {
      selectedPaymentMethod.value = value;
    }
  }, { immediate: true });

  /** only a newly selected payment method is sent (an old one might not be valid anymore) */
  const changedPaymentMethod = computed(() =>
    selectedPaymentMethod.value !== customer.value?.activePaymentMethod ? selectedPaymentMethod.value : undefined,
  );

  async function createPaymentMethod() {
    if (!(await openDialog({ title: t('subscription.payment_verification'), description: t('subscription.payment_verification_description'), confirm: t('ok') }))) {
      return;
    }
    if (!(await saveCustomer())) {
      return;
    }
    try {
      const { checkoutUrl } = await api<{ checkoutUrl: string }>('/api/payment/methods', { method: 'POST', body: { redirectPath: `${window.location.pathname}${window.location.search}` } });
      window.location.assign(checkoutUrl);
    }
    catch (error) {
      showError(error);
    }
  }

  async function deletePaymentMethod(method: PaymentMethod) {
    if (!(await openDialog({ title: t('delete'), description: t('delete_dialog_description', { objectLabel: t('subscription.payment_method') }), confirm: t('ok'), confirmColor: 'error' }))) {
      return;
    }
    if (selectedPaymentMethod.value === method._id) {
      selectedPaymentMethod.value = undefined;
    }
    try {
      await api(`/api/payment/methods/${method._id}`, { method: 'DELETE' });
    }
    catch (error) {
      showError(error);
    }
  }

  return { selectedPaymentMethod, changedPaymentMethod, createPaymentMethod, deletePaymentMethod };
}
