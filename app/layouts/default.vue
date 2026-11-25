<template>
  <div class="flex h-full flex-col">
    <AppHeader v-if="!header.hidden" />
    <AppNav v-if="menu === 'full' || menu === 'plain'" :items="menuItems" />
    <slot />
    <AppTabBar v-if="menu !== 'none'" :items="menuItems" />
  </div>
</template>

<script setup lang="ts">
const { items } = useNavItems();
const { header } = useAppHeader();
const menu = computed(() => header.value.menu ?? 'full');
// v1 showed the bookables list with the plain menus without the admin / info entry
const menuItems = computed(() => (menu.value === 'plain' ? items.value.filter(item => item.key !== 'admin' && item.key !== 'info') : items.value));
</script>
