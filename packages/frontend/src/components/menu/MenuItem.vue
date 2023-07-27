<template>
  <Link :href="href" :to="to" class="border-gray-300 flex py-4 gap-2">
    <slot name="icon">
      <Icon v-if="icon" :name="icon" />
    </slot>
    <div class="flex flex-col">
      <slot name="body">
        <span v-if="title">{{ title }}</span>
        <span v-if="description" class="text-gray-500">{{ description }}</span>
      </slot>
    </div>
    <slot name="end">
      <Icon name="chevron-right" class="ml-auto" />
    </slot>
  </Link>
</template>

<script lang="ts" setup>
import { RouteLocationRaw } from 'vue-router';

import icons from '~/assets/icons';
import Link from '~/components/buttons/Link.vue';
import Icon from '~/components/Icon.vue';

defineProps<{
  icon?: keyof typeof icons;
  title?: string;
  description?: string;
  to?: RouteLocationRaw;
  href?: string;
}>();
</script>
