<template>
  <Header :title="title">
    <div class="relative">
      <span
        v-if="appliedFilters > 0"
        class="
          absolute
          left-4
          top-0.5
          bg-primary-normal
          rounded-full
          w-4
          h-4
          text-center text-xs text-white
          cursor-pointer
        "
        @click="$router.push({ name: 'bookables-filter' })"
        >{{ appliedFilters }}</span
      >
      <IconButton
        icon="filter"
        :class="{ 'text-primary-normal': appliedFilters }"
        @click="$router.push({ name: 'bookables-filter' })"
      />
    </div>

    <IconButton
      data-test="button-account"
      icon="person"
      class="hidden md:block"
      @click="$router.push({ name: 'account-bookings' })"
    />
    <IconButton
      data-test="spaces-button"
      icon="location"
      class="hidden md:block"
      @click="$router.push({ name: 'spaces-list' })"
    />
    <IconButton
      v-if="isAdmin"
      icon="diagram"
      class="hidden md:block"
      :aria-label="t('own_bookings')"
      @click="$router.push({ name: 'space-bookings' })"
    />
    <IconButton
      v-if="isAdmin"
      data-test="button-settings"
      icon="settings"
      class="hidden md:block"
      :aria-label="t('settings')"
      @click="$router.push({ name: 'settings-space-map' })"
    />
    <IconButton
      v-if="!isAdmin"
      icon="info"
      class="hidden md:block"
      :aria-label="t('space_information')"
      data-test="button-space-information"
      @click="$router.push({ name: 'space-info' })"
    />
  </Header>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { isSpaceAdmin } from '~/compositions/useAuthorization';
import { useBookables } from '~/compositions/useBookables';

const { t } = useI18n();

const { currentSpace } = useCurrentSpace();

const isAdmin = ref<boolean>(false);
watch(
  currentSpace,
  async () => {
    if (currentSpace.value === undefined) {
      isAdmin.value = false;
      return;
    }
    isAdmin.value = await isSpaceAdmin(currentSpace.value);
  },
  { immediate: true },
);

const title = computed(() => currentSpace.value?.name || t('bookyp').toUpperCase());

const { dateFilter } = useBookables();

const appliedFilters = computed(() => (dateFilter.value?.start ? 1 : 0));
</script>
