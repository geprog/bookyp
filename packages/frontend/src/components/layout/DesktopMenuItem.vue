<template>
  <router-link :to="to" class="flex items-center py-1.5">
    <div class="relative">
      <div v-if="spot" class="absolute top-0 right-0 bg-primary-dark h-3 w-3 rounded-full block flex-shrink-0" />
      <Icon :name="icon" />
    </div>
    <span class="text-sm px-2">{{ text }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';

import icons from '~/assets/icons';
import Icon from '~/components/Icon.vue';

defineProps<{
  text: string;
  icon: keyof typeof icons;
  to: RouteLocationRaw;
  spot?: boolean;
}>();
</script>
