<template>
  <div class="mx-auto flex w-full flex-col rounded-md border-2 p-4 text-center shadow-full max-sm:max-w-xs sm:max-w-xl" :class="active ? 'border-amber-600' : 'border-gray-300'" :data-test="`plan-card-${plan}`">
    <h2 class="font-bold">
      {{ titles[plan] }}
    </h2>
    <div class="mx-auto mt-2 flex">
      <span>{{ t('subscription.euro') }}</span>
      <span class="text-4xl">{{ spacePlans[plan].pricePerMonth }}</span>
    </div>
    <div>
      <span class="text-base">{{ plan === 'free' ? t('subscription.subtitle_free') : t('subscription.subtitle') }}</span>
    </div>
    <div class="mt-4">
      <span>{{ t(`subscription.plans.descriptions.${plan}`) }}</span>
    </div>
    <ul class="mt-8 ml-4 flex grow flex-col items-start text-left">
      <li v-for="resource in resources" :key="resource" class="pl-1 list-['+_']">
        {{ resource }}
      </li>
    </ul>
    <ul class="mt-2 flex grow flex-col items-start border-t border-gray-700 pt-2 pl-4 text-left">
      <li v-for="feature in features" :key="feature" class="pl-1 list-['✓']">
        {{ feature }}
      </li>
    </ul>
    <a href="https://bookyp.de/pricing" target="_blank" rel="noopener noreferrer" class="mx-auto mt-2 text-amber-600">{{ t('subscription.explorer_all_features') }}</a>
    <div class="mt-12" />
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
import type { SpacePlan } from '#shared/types/models';
import { planLimits, spacePlans } from '#shared/utils/plans';

const props = defineProps<{
  plan: SpacePlan;
  active?: boolean;
}>();

const { t } = useI18n();

const titles = computed<Record<SpacePlan, string>>(() => ({
  free: t('subscription.free_plan'),
  standard: t('subscription.standard_plan'),
  pro: t('subscription.pro_plan'),
}));

const resources = computed(() => [
  t('subscription.plans.resources.users', { x: planLimits.users[props.plan] }),
  t('subscription.plans.resources.bookables', { x: planLimits.bookables[props.plan] }),
  t('subscription.plans.resources.bookings', { x: Number.isFinite(planLimits.bookings[props.plan]) ? planLimits.bookings[props.plan] : t('subscription.plans.resources.unlimited') }),
]);

const features = computed(() => {
  switch (props.plan) {
    case 'free':
      return [t('subscription.plans.features.free_forever'), t('subscription.plans.features.no_credit_card'), t('subscription.plans.features.start_at_a_glance')];
    case 'standard':
      return [t('subscription.plans.features.standard_email_support'), t('subscription.plans.features.start_at_a_glance')];
    default:
      return [t('subscription.plans.features.priority_email_support'), t('subscription.plans.features.request_new_features'), t('subscription.plans.features.start_at_a_glance')];
  }
});
</script>
