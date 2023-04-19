<template>
  <a
    v-if="href !== undefined"
    target="_blank"
    rel="noopener noreferrer"
    :href="href"
    class="flex items-center hover:text-primary-dark"
  >
    <slot />
  </a>
  <router-link v-else-if="to !== undefined" :to="to" class="flex items-center hover:text-primary-dark">
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';

defineProps<{
  href?: string;
  to?: RouteLocationRaw;
}>();
</script>
