<template>
  <div v-if="space">
    <div class="mt-4 flex flex-col p-4 border-primary-dark border-2 shadow-full text-center rounded-md">
      <h2 class="font-bold">{{ t('plan.plan') }}</h2>

      <template v-if="space.plan === 'public'">
        <p>{{ t('plan.public_plan_description') }}</p>

        <Button :text="t('plan.make_space_free')" class="mx-auto mt-4" @click="changePlan('free')" />
      </template>
      <template v-else>
        <p>{{ t('plan.free_plan_description', { amountOfMembers: spaceMembers.length }) }}</p>

        <div class="flex mt-4 justify-center gap-4">
          <a :href="mailtoUpgrade" class="w-1/2">
            <Button :text="t('plan.upgrade')" class="w-full" />
          </a>

          <Button :text="t('plan.make_space_public')" class="w-1/2" @click="changePlan('public')" />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import Button from '~/components/buttons/Button.vue';
import useFeathers from '~/compositions/useFeathers';

const { t } = useI18n();
const feathers = useFeathers();

const props = defineProps({
  space: Model.Space,
});

const space = toRef(props, 'space');
const spaceMembers = computed(() => space.value?.members || []);

const mailtoUpgradeSubject = encodeURIComponent(`[${space.value?._id || ''}] Upgrade plan`);
const mailtoUpgrade = `mailto:bookyp@geprog.com?subject=${mailtoUpgradeSubject}`;

async function changePlan(plan: Model.SpacePlan) {
  if (space.value === undefined) {
    throw new Error('No space available');
  }
  await feathers.service('spaces').patch(space.value?._id, {
    plan,
  });
}
</script>
