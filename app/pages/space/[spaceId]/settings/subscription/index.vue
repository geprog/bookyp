<template>
  <AppContent class="flex-col">
    <div class="my-4">
      <h2 class="text-center text-xl">
        {{ t('subscription.plans.plans') }}
      </h2>

      <div v-if="activePlan !== currentPlan" class="rounded-lg border-2 border-amber-600 p-2 shadow-full">
        <i18n-t keypath="subscription.your_subscription_is_inactive" tag="p">
          <template #plan>
            {{ currentPlan }}
          </template>
          <template #activePlan>
            {{ activePlan }}
          </template>
          <template #email>
            <a :href="mailToGetHelp" class="cursor-pointer underline">{{ contactEmail }}</a>
          </template>
        </i18n-t>
      </div>

      <div v-else-if="waitingForPayment" class="rounded-lg border-2 border-amber-600 p-2 shadow-full" data-test="waiting-for-payment">
        {{ t('subscription.waiting_for_payment', { plan: waitingForPayment }) }}
      </div>

      <div v-else-if="scheduledChange" class="flex flex-wrap items-center gap-2 rounded-lg border-2 border-amber-600 p-2 shadow-full" data-test="scheduled-plan-change">
        <span>{{ t('subscription.scheduled_change', { plan: scheduledChange.plan, date: scheduledChange.date }) }}</span>
        <AppButton class="ml-auto" outlined data-test="keep-plan" @click="navigateTo(`/space/${spaceId}/settings/subscription/upgrade/${space.plan}`)">
          {{ t('subscription.keep_plan') }}
        </AppButton>
      </div>

      <div class="mt-4 flex flex-wrap gap-4 md:flex-nowrap">
        <SpacePlanCard v-for="plan in plans" :key="plan" :plan="plan" :active="activePlan === plan" class="md:w-1/3">
          <template #actions>
            <AppButton v-if="activePlan === plan" disabled class="w-full">
              {{ t('subscription.current_plan') }}
            </AppButton>
            <AppButton v-else :data-test="`change-plan-${plan}`" class="w-full" @click="navigateTo(`/space/${spaceId}/settings/subscription/upgrade/${plan}`)">
              {{ spacePlans[plan].pricePerMonth < spacePlans[activePlan].pricePerMonth ? t('subscription.downgrade') : t('subscription.upgrade') }}
            </AppButton>
          </template>
        </SpacePlanCard>
      </div>

      <SpaceInvoices />
    </div>

    <div v-if="user?.isSuperAdmin" class="mx-auto flex w-full flex-col rounded-md border-2 border-gray-300 p-4 text-center shadow-full">
      <h2 class="text-xl font-bold">
        {{ t('super_admin') }}
      </h2>
      <form class="mt-4" @submit.prevent="updatePlan">
        <span class="text-left">{{ t('subscription_update_super_admin_description') }}</span>
        <IconField icon="i-bookyp-credit-card">
          <select v-model="superAdminForm.plan" class="bg-transparent">
            <option value="free">
              {{ t('subscription.free_plan') }}
            </option>
            <option value="standard">
              {{ t('subscription.standard_plan') }}
            </option>
            <option value="pro">
              {{ t('subscription.pro_plan') }}
            </option>
          </select>
        </IconField>
        <IconField icon="i-bookyp-clock">
          <DateTimeInput v-model="superAdminForm.activeUntil" />
        </IconField>
        <AppButton type="submit" class="mx-auto mt-2">
          {{ t('update_subscription') }}
        </AppButton>
      </form>
    </div>
  </AppContent>
</template>

<script setup lang="ts">
import type { SpacePlan } from '#shared/types/models';
import dayjs from 'dayjs';
import { getCurrentPlan, isSpacePlan, spacePlanNames, spacePlans } from '#shared/utils/plans';

const { t } = useI18n();
const { user } = useAuth();
const { space, spaceId } = useCurrentSpace();
const { activePlan } = useSubscriptionLimits(spaceId);
const { api, showError } = useApi();
const { openDialog } = useDialog();
const toast = useAppToast();
const { contactEmail } = useRuntimeConfig().public;

useAppHeader(() => ({ title: t('subscription.space_subscription'), back: `/space/${spaceId.value}/settings` }));

const plans = spacePlanNames;

const currentPlan = computed(() => getCurrentPlan(space.value));

/** after the checkout of a paid plan the plan switches as soon as the payment provider confirms the payment */
const route = useRoute();
const waitingForPayment = computed(() => {
  const plan = route.query.checkout;
  return isSpacePlan(plan) && plan !== 'free' && activePlan.value !== plan ? plan : undefined;
});
watch([() => route.query.checkout, activePlan], ([checkout, plan]) => {
  if (checkout && checkout === plan) {
    void navigateTo({ query: {} }, { replace: true });
  }
}, { immediate: true });
/** a downgrade that takes effect at the end of the paid period */
const scheduledChange = computed(() => {
  const { scheduledPlan, currentPeriodEnd } = space.value;
  if (!scheduledPlan || !currentPeriodEnd || currentPlan.value === scheduledPlan) {
    return undefined;
  }
  return { plan: scheduledPlan, date: dayjs(currentPeriodEnd).format('DD.MM.YYYY') };
});

const mailToGetHelp = computed(() =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(t('mail_for_subscription_error'))}%20[user:${user.value?._id ?? ''}, space:${spaceId.value}]&body=${encodeURIComponent(t('hey_bookyp_team'))},%20`,
);

const superAdminForm = reactive<{ plan: SpacePlan; activeUntil?: Date }>({
  plan: space.value.plan,
  activeUntil: space.value.activeUntil ? new Date(space.value.activeUntil) : undefined,
});

async function updatePlan() {
  if (!(await openDialog({ title: t('dangerous_super_admin_action'), description: t('dangerous_super_admin_action_description'), confirm: t('ok') }))) {
    return;
  }
  try {
    await api(`/api/spaces/${spaceId.value}`, {
      method: 'PATCH',
      body: { plan: superAdminForm.plan, activeUntil: superAdminForm.activeUntil ? superAdminForm.activeUntil.toISOString() : null },
    });
    toast.success(t('updated_subscription'));
  }
  catch (error) {
    showError(error);
  }
}
</script>
