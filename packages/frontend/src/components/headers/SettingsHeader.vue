<template>
  <Header
    :title="title"
    :back-fallback="{ name: 'bookables-map' }"
    :right-class="!changed ? 'hidden md:flex' : 'md:flex'"
  >
    <template v-if="$slots.actions" #right>
      <slot name="actions" />
    </template>
  </Header>
  <SpaceDesktopMenu />
</template>

<script lang="ts" setup>
import Header from '~/components/headers/Header.vue';
import SpaceDesktopMenu from '~/components/layout/SpaceDesktopMenu.vue';

defineProps<{
  title: string;
  changed?: boolean;
}>();
</script>
